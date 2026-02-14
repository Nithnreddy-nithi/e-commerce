from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.database import get_db
from app.repositories.user_repo import UserRepository
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, Token

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    return await auth_service.register_user(user_in)

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    # Form data uses 'username' but we treat it as email
    from app.schemas.user import UserLogin
    user_login = UserLogin(email=form_data.username, password=form_data.password)
    return await auth_service.authenticate_user(user_login)
