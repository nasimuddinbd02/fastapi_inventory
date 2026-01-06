from pydantic import BaseModel, field_validator
from typing import Optional

class InventoryCreateViewModel(BaseModel):
    """ViewModel for inventory creation"""
    product_title: str  # Use product name instead of ID
    stock_quantity: float  # Different from 'quantity'
    warehouse_location: Optional[str] = None  # Different from 'location'

    @field_validator('stock_quantity', mode="before")
    @classmethod
    def validate_stock_quantity(cls, v):
        if v < 0:
            raise ValueError('Stock quantity cannot be negative')
        return v

class InventoryUpdateViewModel(BaseModel):
    """ViewModel for inventory updates"""
    stock_quantity: Optional[float] = None
    warehouse_location: Optional[str] = None

    @field_validator('stock_quantity', mode="before")
    @classmethod
    def validate_stock_quantity(cls, v):
        if v is not None and v < 0:
            raise ValueError('Stock quantity cannot be negative')
        return v

class InventoryViewModel(BaseModel):
    """ViewModel for inventory display"""
    id: int
    stock_quantity: float
    warehouse_location: Optional[str] = None
    product_id: int  # Include product_id instead of full product object
    created_at: str  # Formatted date