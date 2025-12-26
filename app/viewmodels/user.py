from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

class UserCreateViewModel(BaseModel):
    """ViewModel for user creation - represents user input"""
    login_name: str  # Different from username in DB
    email_address: EmailStr  # Different from email
    display_name: Optional[str] = None  # Different from full_name
    password: str
    confirm_password: str
    accept_terms: bool = False

    @field_validator('login_name')
    @classmethod
    def validate_login_name(cls, v):
        if len(v) < 3:
            raise ValueError('Login name must be at least 3 characters')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Login name can only contain letters, numbers, underscores, and hyphens')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v

class UserUpdateViewModel(BaseModel):
    """ViewModel for user updates"""
    email_address: Optional[EmailStr] = None
    display_name: Optional[str] = None
    current_password: Optional[str] = None  # For verification
    new_password: Optional[str] = None
    confirm_new_password: Optional[str] = None

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        if v and len(v) < 8:
            raise ValueError('New password must be at least 8 characters')
        return v

    @field_validator('confirm_new_password')
    @classmethod
    def new_passwords_match(cls, v, info):
        if v and 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('New passwords do not match')
        return v

class UserLoginViewModel(BaseModel):
    """ViewModel for user login"""
    login_name: str
    password: str

class UserViewModel(BaseModel):
    """ViewModel for user display - what users see"""
    id: int
    login_name: str
    email_address: EmailStr
    display_name: Optional[str] = None
    is_active: bool
    account_created: str  # Formatted date
    last_updated: Optional[str] = None