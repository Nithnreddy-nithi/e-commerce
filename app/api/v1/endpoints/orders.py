from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.order import Order
from app.repositories.order_repo import OrderRepository
from app.repositories.cart_repo import CartRepository
from app.repositories.product_repo import ProductRepository
from app.services.order_service import OrderService
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter()

def get_order_service(db: AsyncSession = Depends(get_db)):
    order_repo = OrderRepository(db)
    cart_repo = CartRepository(db)
    product_repo = ProductRepository(db)
    return OrderService(order_repo, cart_repo, product_repo)

from pydantic import BaseModel

class CheckoutRequest(BaseModel):
    shipping_address_id: int | None = None
    coupon_code: str | None = None

@router.post("/checkout", response_model=Order)
async def checkout(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service)
):
    try:
        logger.info(f"CHECKOUT: Starting for user_id={current_user.id}")
        result = await service.checkout(current_user.id, request.shipping_address_id, request.coupon_code)
        logger.info(f"CHECKOUT: Success! Order id={result.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CHECKOUT ERROR: {type(e).__name__}: {str(e)}")
        logger.error(f"CHECKOUT TRACEBACK:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Checkout failed: {type(e).__name__}: {str(e)}")

@router.get("/", response_model=List[Order])
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service)
):
    return await service.get_my_orders(current_user.id)

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    order_repo = OrderRepository(db)
    order = await order_repo.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return order
