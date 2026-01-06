from pydantic import BaseModel, field_validator
from typing import Optional
from .category import CategoryViewModel
from .supplier import SupplierViewModel

class ProductCreateViewModel(BaseModel):
    """ViewModel for product creation"""
    product_title: str  # Different from 'name'
    product_description: Optional[str] = None
    unit_price: float  # Different from 'price'
    category_name: str  # Use name instead of ID
    supplier_name: str  # Use name instead of ID

    @field_validator('product_title')
    @classmethod
    def validate_product_title(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Product title must be at least 2 characters')
        return v.strip()

    @field_validator('unit_price')
    @classmethod
    def validate_unit_price(cls, v):
        if v <= 0:
            raise ValueError('Unit price must be greater than 0')
        return v

class ProductUpdateViewModel(BaseModel):
    """ViewModel for product updates"""
    product_title: Optional[str] = None
    product_description: Optional[str] = None
    unit_price: Optional[float] = None
    category_name: Optional[str] = None
    supplier_name: Optional[str] = None

    @field_validator('product_title')
    @classmethod
    def validate_product_title(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Product title must be at least 2 characters')
        return v.strip() if v else v

    @field_validator('unit_price')
    @classmethod
    def validate_unit_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Unit price must be greater than 0')
        return v

class ProductViewModel(BaseModel):
    """ViewModel for product display"""
    id: int
    product_title: str
    product_description: Optional[str] = None
    unit_price: float
    category: Optional[CategoryViewModel] = None
    supplier: Optional[SupplierViewModel] = None
    available_stock: float = 0  # Stock quantity from inventory
    created_at: str  # Formatted date