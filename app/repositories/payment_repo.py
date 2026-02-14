from typing import Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment import Payment, PaymentStatus
from app.models.order import Order, OrderStatus

class PaymentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_payment_record(self, 
                                  order_id: int, 
                                  amount: float, 
                                  razorpay_order_id: str, 
                                  currency: str = "INR") -> Payment:
        db_payment = Payment(
            order_id=order_id,
            amount=amount,
            currency=currency,
            razorpay_order_id=razorpay_order_id,
            status=PaymentStatus.PENDING
        )
        self.session.add(db_payment)
        await self.session.flush()
        await self.session.refresh(db_payment)
        return db_payment

    async def get_by_razorpay_order_id(self, razorpay_order_id: str) -> Optional[Payment]:
        result = await self.session.execute(
            select(Payment).filter(Payment.razorpay_order_id == razorpay_order_id)
        )
        return result.scalars().first()

    async def mark_payment_success(self, payment: Payment, transaction_id: str) -> Payment:
        payment.status = PaymentStatus.SUCCESS
        payment.transaction_id = transaction_id
        
        order_result = await self.session.execute(select(Order).filter(Order.id == payment.order_id))
        order = order_result.scalars().first()
        if order:
            order.status = OrderStatus.CONFIRMED
            self.session.add(order)
            
        self.session.add(payment)
        await self.session.flush()
        await self.session.refresh(payment)
        return payment

    async def mark_payment_failed(self, payment: Payment) -> Payment:
        payment.status = PaymentStatus.FAILED
        self.session.add(payment)
        await self.session.flush()
        await self.session.refresh(payment)
        return payment
