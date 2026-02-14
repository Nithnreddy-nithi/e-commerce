import uuid
from fastapi import HTTPException, status
from app.core.config import settings
from app.repositories.payment_repo import PaymentRepository
from app.repositories.shipment_repo import ShipmentRepository
from app.models.order import Order
from app.schemas.payment import PaymentResponse, PaymentVerify
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    def __init__(self, payment_repo: PaymentRepository):
        self.payment_repo = payment_repo
        
        # Auto-detect mock mode: use mock if key starts with "mock_" 
        # OR if key looks like a placeholder (contains YOUR or is empty)
        key_id = settings.RAZORPAY_KEY_ID or ""
        self.is_mock = (
            key_id.startswith("mock_") or 
            "YOUR" in key_id.upper() or 
            len(key_id) < 5
        )
        
        if self.is_mock:
            logger.info("PaymentService: Running in MOCK mode (no real Razorpay calls)")
            self.client = None
        else:
            import razorpay
            self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    async def create_order_payment(self, order: Order) -> PaymentResponse:
        amount_paise = int(order.total_amount * 100)
        
        if self.is_mock:
            razorpay_order_id = f"order_mock_{uuid.uuid4().hex[:8]}"
            logger.info(f"MOCK payment created: {razorpay_order_id} for order #{order.id}")
        else:
            try:
                razorpay_order_data = {
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": f"order_{order.id}",
                    "payment_capture": 1
                }
                razorpay_order = self.client.order.create(data=razorpay_order_data)
                razorpay_order_id = razorpay_order['id']
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Razorpay Error: {str(e)}")

        # Save pending payment to DB
        await self.payment_repo.create_payment_record(
            order_id=order.id,
            amount=order.total_amount,
            razorpay_order_id=razorpay_order_id
        )

        # In mock mode, return "mock_" prefixed key so frontend shows confirm dialog
        return PaymentResponse(
            order_id=order.id,
            razorpay_order_id=razorpay_order_id,
            amount=order.total_amount,
            currency="INR",
            key_id="mock_key" if self.is_mock else settings.RAZORPAY_KEY_ID
        )

    async def verify_payment(self, verification_data: PaymentVerify) -> bool:
        if self.is_mock:
            # Accept any mock signature
            logger.info(f"MOCK payment verified: {verification_data.razorpay_order_id}")
        else:
            try:
                import razorpay
                self.client.utility.verify_payment_signature({
                    'razorpay_order_id': verification_data.razorpay_order_id,
                    'razorpay_payment_id': verification_data.razorpay_payment_id,
                    'razorpay_signature': verification_data.razorpay_signature
                })
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid Payment Signature")

        # Fetch payment record
        payment = await self.payment_repo.get_by_razorpay_order_id(verification_data.razorpay_order_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")

        # Mark as success — this also updates order status to CONFIRMED
        await self.payment_repo.mark_payment_success(payment, verification_data.razorpay_payment_id)

        # Auto-create a Shipment record for this order (ready_to_ship)
        shipment_repo = ShipmentRepository(self.payment_repo.session)
        try:
            await shipment_repo.create_shipment(payment.order_id)
            logger.info(f"Shipment created for order #{payment.order_id}")
        except Exception as e:
            # Don't fail payment verification if shipment creation fails (e.g., duplicate)
            logger.warning(f"Shipment creation skipped for order #{payment.order_id}: {e}")
        
        return True
