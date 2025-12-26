from pydantic import BaseModel, field_validator
from typing import Optional

class CategoryCreateViewModel(BaseModel):
    """ViewModel for category creation"""
    category_name: str
    category_description: Optional[str] = None

    @field_validator('category_name')
    @classmethod
    def validate_category_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Category name must be at least 2 characters')
        return v.strip()

class CategoryUpdateViewModel(BaseModel):
    """ViewModel for category updates"""
    category_name: Optional[str] = None
    category_description: Optional[str] = None

    @field_validator('category_name')
    @classmethod
    def validate_category_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Category name must be at least 2 characters')
        return v.strip() if v else v

class CategoryViewModel(BaseModel):
    """ViewModel for category display"""
    id: int
    category_name: str
    category_description: Optional[str] = None
    created_at: str  # Formatted date