from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product, Category
from app.schemas.product import ProductCreate, CategoryCreate, ProductUpdate

class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_products(self, skip: int = 0, limit: int = 100, search: str | None = None, category_id: int | None = None) -> List[Product]:
        query = select(Product)
        if search:
            query = query.filter(
                Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%")
            )
        if category_id:
            query = query.filter(Product.category_id == category_id)
        query = query.order_by(Product.id).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_product(self, product_id: int) -> Optional[Product]:
        result = await self.session.execute(
            select(Product).filter(Product.id == product_id)
        )
        return result.scalars().first()

    async def create_product(self, product_in: ProductCreate) -> Product:
        db_product = Product(**product_in.model_dump())
        self.session.add(db_product)
        await self.session.flush()
        await self.session.refresh(db_product)
        return await self.get_product(db_product.id)

    async def update_product(self, product_id: int, product_in: ProductUpdate) -> Optional[Product]:
        db_product = await self.get_product(product_id)
        if not db_product:
            return None
        
        update_data = product_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
            
        self.session.add(db_product)
        await self.session.flush()
        return await self.get_product(product_id)

    async def create_category(self, category_in: CategoryCreate) -> Category:
        db_category = Category(**category_in.model_dump())
        self.session.add(db_category)
        await self.session.flush()
        await self.session.refresh(db_category)
        return db_category

    async def get_categories(self, skip: int = 0, limit: int = 100) -> List[Category]:
        result = await self.session.execute(select(Category).order_by(Category.id).offset(skip).limit(limit))
        return result.scalars().all()

    async def decrease_stock(self, product_id: int, quantity: int):
        from sqlalchemy import update
        await self.session.execute(
            update(Product)
            .where(Product.id == product_id)
            .values(stock_quantity=Product.stock_quantity - quantity)
        )
        await self.session.flush()
