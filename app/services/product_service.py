from typing import List, Optional
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, CategoryCreate
from app.models.product import Product, Category

class ProductService:
    def __init__(self, product_repo: ProductRepository):
        self.product_repo = product_repo

    async def get_all_products(self, skip: int = 0, limit: int = 100) -> List[Product]:
        return await self.product_repo.get_all_products(skip, limit)

    async def get_product(self, product_id: int) -> Optional[Product]:
        return await self.product_repo.get_product(product_id)

    async def create_product(self, product_in: ProductCreate) -> Product:
        return await self.product_repo.create_product(product_in)

    async def update_product(self, product_id: int, product_in: ProductUpdate) -> Optional[Product]:
        return await self.product_repo.update_product(product_id, product_in)

    async def create_category(self, category_in: CategoryCreate) -> Category:
        return await self.product_repo.create_category(category_in)

    async def get_categories(self, skip: int = 0, limit: int = 100) -> List[Category]:
        return await self.product_repo.get_categories(skip, limit)
