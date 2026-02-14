from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.cart import Cart, CartItemCreate
from app.repositories.cart_repo import CartRepository
from app.repositories.product_repo import ProductRepository
from app.services.cart_service import CartService

router = APIRouter()

def get_cart_service(db: AsyncSession = Depends(get_db)):
    cart_repo = CartRepository(db)
    product_repo = ProductRepository(db)
    return CartService(cart_repo, product_repo)

@router.get("/", response_model=Cart)
async def get_my_cart(
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service)
):
    return await service.get_my_cart(current_user.id)

@router.post("/items", response_model=Cart) # Returning full cart is easier for frontend
async def add_item_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service)
):
    user_id = current_user.id
    await service.add_item(user_id, item_in)
    return await service.get_my_cart(user_id)

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service)
):
    await service.remove_item(current_user.id, item_id)

@router.put("/items/{item_id}", response_model=Cart)
async def update_cart_item_quantity(
    item_id: int,
    quantity: int,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service)
):
    return await service.update_item_quantity(current_user.id, item_id, quantity)

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service)
):
    await service.clear_cart(current_user.id)
