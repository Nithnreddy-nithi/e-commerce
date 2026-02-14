from datetime import timedelta
from typing import Optional 
from fastapi import HTTPException, status
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserCreate, UserLogin, Token

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register_user(self, user_in: UserCreate) -> Token:
        user = await self.user_repo.get_by_email(user_in.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        new_user = await self.user_repo.create(user_in)
        # Auto login after register
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=new_user.email, expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")

    async def authenticate_user(self, user_in: UserLogin) -> Token:
        user = await self.user_repo.get_by_email(user_in.email)
        if not user or not verify_password(user_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=user.email, expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")
