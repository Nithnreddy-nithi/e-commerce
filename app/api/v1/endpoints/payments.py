from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.core.database import get_db
from app.services.payment_service import PaymentService
from app.repositories.payment_repo import PaymentRepository
from app.schemas.payment import PaymentResponse, PaymentVerify
from app.models.user import User
from app.models.order import Order
from app.repositories.order_repo import OrderRepository # Assuming this exists from Phase 2
# If OrderRepository doesn't exist, I'll need to create a simple one or access Order model directly
from sqlalchemy.future import select

router = APIRouter()

# Helper to get service
def get_payment_service(db: AsyncSession) -> PaymentService:
    repo = PaymentRepository(db)
    return PaymentService(repo)

@router.post("/order/{order_id}", response_model=PaymentResponse)
async def create_payment_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Initiate a payment for an existing Order.
    Calls Razorpay to create an order_id.
    """
    # 1. Fetch Order
    # We can use a direct query here if OrderRepository isn't handy, 
    # but strict layering suggests using a Repo. I will use direct query for now to be safe.
    result = await db.execute(select(Order).filter(Order.id == order_id))
    order = result.scalars().first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this order")
        
    # 2. Call Payment Service
    service = get_payment_service(db)
    return await service.create_order_payment(order)

@router.post("/verify")
async def verify_payment(
    verify_data: PaymentVerify,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Verify the payment signature from Razorpay.
    """
    service = get_payment_service(db)
    success = await service.verify_payment(verify_data)
    
    if success:
        return {"status": "success", "message": "Payment verified and Order confirmed"}
    else:
        raise HTTPException(status_code=400, detail="Verification failed")
