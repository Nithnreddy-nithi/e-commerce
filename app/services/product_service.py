from typing import List, Optional
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, CategoryCreate
from app.models.product import Product, Category
from app.core.cache import cache_manager

class ProductService:
    def __init__(self, product_repo: ProductRepository):
        self.product_repo = product_repo

    async def get_all_products(self, skip: int = 0, limit: int = 100, search: str | None = None, category_id: int | None = None) -> List[Product]:
        # Build cache key from params
        cache_key = f"skip={skip}&limit={limit}&search={search}&cat={category_id}"
        cached = cache_manager.get("products_list", cache_key)
        if cached is not None:
            return cached

        products = await self.product_repo.get_all_products(skip, limit, search, category_id)
        cache_manager.set("products_list", cache_key, products)
        return products

    async def get_product(self, product_id: int) -> Optional[Product]:
        cache_key = str(product_id)
        cached = cache_manager.get("product_detail", cache_key)
        if cached is not None:
            return cached

        product = await self.product_repo.get_product(product_id)
        if product:
            cache_manager.set("product_detail", cache_key, product)
        return product

    async def create_product(self, product_in: ProductCreate) -> Product:
        product = await self.product_repo.create_product(product_in)
        # Invalidate list cache since a new product was added
        cache_manager.invalidate("products_list")
        return product

    async def update_product(self, product_id: int, product_in: ProductUpdate) -> Optional[Product]:
        product = await self.product_repo.update_product(product_id, product_in)
        if product:
            # Invalidate both the specific product and list caches
            cache_manager.invalidate_key("product_detail", str(product_id))
            cache_manager.invalidate("products_list")
        return product

    async def create_category(self, category_in: CategoryCreate) -> Category:
        category = await self.product_repo.create_category(category_in)
        cache_manager.invalidate("categories")
        return category

    async def get_categories(self, skip: int = 0, limit: int = 100) -> List[Category]:
        cache_key = f"skip={skip}&limit={limit}"
        cached = cache_manager.get("categories", cache_key)
        if cached is not None:
            return cached

        categories = await self.product_repo.get_categories(skip, limit)
        cache_manager.set("categories", cache_key, categories)
        return categories
