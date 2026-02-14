from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.core.database import get_db
from app.repositories.product_repo import ProductRepository
from app.services.product_service import ProductService
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate, CategoryCreate, CategoryResponse
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
async def read_products(
    skip: int = 0, limit: int = 100,
    search: str | None = None,
    category_id: int | None = None,
    db: AsyncSession = Depends(get_db)
):
    repo = ProductRepository(db)
    service = ProductService(repo)
    return await service.get_all_products(skip=skip, limit=limit, search=search, category_id=category_id)

# Categories MUST come BEFORE /{product_id} so FastAPI matches them first
@router.get("/categories", response_model=List[CategoryResponse])
async def read_categories(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    repo = ProductRepository(db)
    service = ProductService(repo)
    return await service.get_categories(skip=skip, limit=limit)

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category_in: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
):
    repo = ProductRepository(db)
    service = ProductService(repo)
    return await service.create_category(category_in)

# Dynamic path param routes AFTER static paths
@router.get("/{product_id}", response_model=ProductResponse)
async def read_product(
    product_id: int, db: AsyncSession = Depends(get_db)
):
    repo = ProductRepository(db)
    service = ProductService(repo)
    product = await service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
):
    repo = ProductRepository(db)
    service = ProductService(repo)
    return await service.create_product(product_in)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
):
    repo = ProductRepository(db)
    service = ProductService(repo)
    product = await service.update_product(product_id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
