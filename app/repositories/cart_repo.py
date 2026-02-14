from typing import Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cart import Cart, CartItem
from app.models.product import Product, Category
import logging

logger = logging.getLogger(__name__)

class CartRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_cart_by_user_id(self, user_id: int) -> Optional[Cart]:
        result = await self.session.execute(
            select(Cart)
            .options(
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.category)
            )
            .filter(Cart.user_id == user_id)
        )
        return result.scalars().first()

    async def create_cart(self, user_id: int) -> Cart:
        cart = Cart(user_id=user_id)
        self.session.add(cart)
        await self.session.flush()
        await self.session.refresh(cart)
        return await self.get_cart_by_user_id(user_id)

    async def get_cart_item(self, cart_id: int, product_id: int) -> Optional[CartItem]:
        result = await self.session.execute(
            select(CartItem).filter(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
        )
        return result.scalars().first()
    
    async def get_cart_item_by_id(self, item_id: int) -> Optional[CartItem]:
        result = await self.session.execute(
            select(CartItem).filter(CartItem.id == item_id)
        )
        return result.scalars().first()

    async def add_item(self, cart_id: int, product_id: int, quantity: int) -> CartItem:
        item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity)
        self.session.add(item)
        await self.session.flush()
        return item

    async def update_item_quantity(self, item: CartItem, quantity: int) -> CartItem:
        item.quantity = quantity
        self.session.add(item)
        await self.session.flush()
        return item

    async def remove_item(self, item: CartItem):
        await self.session.delete(item)
        await self.session.flush()
        
    async def clear_cart(self, cart_id: int):
        from sqlalchemy import delete
        await self.session.execute(delete(CartItem).where(CartItem.cart_id == cart_id))
        await self.session.flush()
