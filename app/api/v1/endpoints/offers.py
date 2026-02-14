from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.core.database import get_db
from app.models.coupon import Coupon
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime

# Schemas
class CouponCreate(BaseModel):
    code: str
    discount_type: str = "percent"
    value: float
    min_order_amount: float = 0.0
    valid_to: datetime | None = None

class CouponResponse(BaseModel):
    id: int
    code: str
    value: float
    discount_type: str
    is_active: bool
    
    class Config:
        from_attributes = True

class ApplyCouponRequest(BaseModel):
    cart_total: float

class ApplyCouponResponse(BaseModel):
    code: str
    discount_amount: float
    final_total: float

router = APIRouter()

@router.post("/", response_model=CouponResponse)
async def create_coupon(
    coupon_in: CouponCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
):
    """
    Admin: Create a new coupon.
    """
    # Check exists
    result = await db.execute(select(Coupon).filter(Coupon.code == coupon_in.code))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Coupon code already exists")
        
    coupon = Coupon(**coupon_in.dict())
    db.add(coupon)
    await db.flush()
    await db.refresh(coupon)
    return coupon

@router.post("/{code}/apply")
async def apply_coupon(
    code: str,
    request: ApplyCouponRequest,
    db: AsyncSession = Depends(get_db),
    # Public or User? Let's say User for now.
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Validate and apply a coupon to a cart total.
    Returns the discount amount.
    """
    result = await db.execute(select(Coupon).filter(Coupon.code == code, Coupon.is_active == True))
    coupon = result.scalars().first()
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon")
        
    # Check expiry
    if coupon.valid_to and coupon.valid_to.replace(tzinfo=None) < datetime.utcnow():
         raise HTTPException(status_code=400, detail="Coupon expired")

    # Check min order
    if request.cart_total < coupon.min_order_amount:
         raise HTTPException(status_code=400, detail=f"Minimum order amount {coupon.min_order_amount} required")

    # Calculate discount
    discount = 0.0
    if coupon.discount_type == "percent":
        discount = (request.cart_total * coupon.value) / 100
        if coupon.max_discount_amount:
            discount = min(discount, coupon.max_discount_amount)
    else:
        discount = coupon.value
        
    # Validation: Discount cannot be more than total
    discount = min(discount, request.cart_total)
    
    return ApplyCouponResponse(
        code=coupon.code,
        discount_amount=discount,
        final_total=request.cart_total - discount
    )
