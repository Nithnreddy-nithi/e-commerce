from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order, OrderItem
from app.models.product import Product

class OrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_order(self, order: Order) -> Order:
        self.session.add(order)
        await self.session.flush()
        await self.session.refresh(order)
        return await self.get_order(order.id)

    async def get_orders_by_user(self, user_id: int) -> List[Order]:
        result = await self.session.execute(
            select(Order)
            .options(
                selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
                 selectinload(Order.shipment)
            )
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
        )
        return result.scalars().all()

    async def get_order(self, order_id: int) -> Optional[Order]:
        result = await self.session.execute(
            select(Order)
            .options(
                selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
                selectinload(Order.shipment),
                 selectinload(Order.address) # Ensure address is loaded if needed
            )
            .filter(Order.id == order_id)
        )
        return result.scalars().first()
