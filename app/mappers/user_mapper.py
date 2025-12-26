from app.viewmodels.user import (
    UserCreateViewModel, UserUpdateViewModel, UserViewModel, UserLoginViewModel
)
from app.schemas.user import UserCreate, UserUpdate, User

def map_user_create_viewmodel_to_dto(viewmodel: UserCreateViewModel) -> UserCreate:
    """Map UserCreateViewModel to UserCreate DTO for database operations"""
    return UserCreate(
        username=viewmodel.login_name,
        email=viewmodel.email_address,
        full_name=viewmodel.display_name,
        password=viewmodel.password
    )

def map_user_update_viewmodel_to_dto(viewmodel: UserUpdateViewModel) -> UserUpdate:
    """Map UserUpdateViewModel to UserUpdate DTO"""
    return UserUpdate(
        email=viewmodel.email_address,
        full_name=viewmodel.display_name,
        password=viewmodel.new_password if viewmodel.new_password else None
    )

def map_user_to_viewmodel(user: User) -> UserViewModel:
    """Map User DTO to UserViewModel for API responses"""
    return UserViewModel(
        id=user.id,
        login_name=user.username,
        email_address=user.email,
        display_name=user.full_name,
        is_active=user.is_active,
        account_created=user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else None,
        last_updated=user.updated_at.strftime("%Y-%m-%d %H:%M:%S") if user.updated_at else None
    )

def map_login_viewmodel_to_credentials(viewmodel: UserLoginViewModel) -> tuple[str, str]:
    """Extract credentials from login viewmodel"""
    return viewmodel.login_name, viewmodel.password