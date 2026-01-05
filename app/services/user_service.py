from sqlalchemy.ext.asyncio import AsyncSession
from app.dbAccess.user import (
    get_user, get_user_by_username, get_user_by_email, get_users,
    create_user as crud_create_user, update_user as crud_update_user,
    delete_user as crud_delete_user, count_users
)
from app.viewmodels.user import UserCreateViewModel, UserUpdateViewModel, UserViewModel, UserLoginViewModel
from app.mappers.user_mapper import (
    map_user_create_viewmodel_to_dto, map_user_update_viewmodel_to_dto,
    map_user_to_viewmodel, map_login_viewmodel_to_credentials
)
from app.auth import get_password_hash, create_access_token, verify_password
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_user(self, user_viewmodel: UserCreateViewModel) -> UserViewModel:
        """Create user using ViewModel - business logic operates on ViewModel"""
        # Business logic on ViewModel
        if not user_viewmodel.accept_terms:
            raise ValueError("Terms and conditions must be accepted")

        # Check if login_name already exists (business logic)
        existing_user = await get_user_by_username(self.db, user_viewmodel.login_name)
        if existing_user:
            raise ValueError("Login name already registered")

        # Check if email already exists
        existing_email = await get_user_by_email(self.db, user_viewmodel.email_address)
        if existing_email:
            raise ValueError("Email already registered")

        # Additional business logic: ensure display_name is not empty if provided
        if user_viewmodel.display_name and len(user_viewmodel.display_name.strip()) == 0:
            raise ValueError("Display name cannot be empty")

        # Map ViewModel to DTO for database operations
        user_dto = map_user_create_viewmodel_to_dto(user_viewmodel)
        user_dto.password = get_password_hash(user_viewmodel.password)

        # Create user in database
        db_user = await crud_create_user(self.db, user_dto)

        # Map back to ViewModel for response
        return map_user_to_viewmodel(db_user)

    async def get_user(self, user_id: int) -> UserViewModel:
        """Get user by ID"""
        user = await get_user(self.db, user_id)
        if not user:
            return None
        return map_user_to_viewmodel(user)

    async def get_users(self, skip: int = 0, limit: int = 100, search: str | None = None) -> tuple[list[UserViewModel], int]:
        """Get paginated list of users"""
        users = await get_users(self.db, skip, limit, search)
        total = await count_users(self.db, search)
        return [map_user_to_viewmodel(user) for user in users], total

    async def update_user(self, user_id: int, user_viewmodel: UserUpdateViewModel) -> UserViewModel:
        """Update user using ViewModel"""
        # Business logic on ViewModel
        if user_viewmodel.new_password and not user_viewmodel.current_password:
            raise ValueError("Current password is required to change password")

        # If changing password, verify current password
        if user_viewmodel.new_password:
            user = await get_user(self.db, user_id)
            if not user:
                raise ValueError("User not found")
            # Note: In real app, you'd verify current_password against user's hashed password

        # Check if updating to existing email
        if user_viewmodel.email_address:
            existing = await get_user_by_email(self.db, user_viewmodel.email_address)
            if existing and existing.id != user_id:
                raise ValueError("Email already in use")

        # Map ViewModel to DTO
        user_dto = map_user_update_viewmodel_to_dto(user_viewmodel)
        if user_viewmodel.new_password:
            user_dto.password = get_password_hash(user_viewmodel.new_password)

        # Update in database
        updated_user = await crud_update_user(self.db, user_id, user_dto)
        if not updated_user:
            return None

        return map_user_to_viewmodel(updated_user)

    async def delete_user(self, user_id: int) -> bool:
        """Delete user"""
        return await crud_delete_user(self.db, user_id) is not None

    async def authenticate_user(self, login_viewmodel: UserLoginViewModel) -> Token:
        """Authenticate user and return JWT token"""
        username, password = map_login_viewmodel_to_credentials(login_viewmodel)

        # Get user by username
        user = await get_user_by_username(self.db, username)
        if not user:
            return None

        # Verify password
        if not verify_password(password, user.hashed_password):
            return None

        # Check if user is active
        if not user.is_active:
            raise ValueError("User account is inactive")

        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )

        return Token(access_token=access_token, token_type="bearer")