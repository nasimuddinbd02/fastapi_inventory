from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

class SupplierCreateViewModel(BaseModel):
    """ViewModel for supplier creation"""
    supplier_name: str
    contact_email: Optional[EmailStr] = None
    contact_info: Optional[str] = None

    @field_validator('supplier_name')
    @classmethod
    def validate_supplier_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Supplier name must be at least 2 characters')
        return v.strip()

class SupplierUpdateViewModel(BaseModel):
    """ViewModel for supplier updates"""
    supplier_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_info: Optional[str] = None

    @field_validator('supplier_name')
    @classmethod
    def validate_supplier_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Supplier name must be at least 2 characters')
        return v.strip() if v else v

class SupplierViewModel(BaseModel):
    """ViewModel for supplier display"""
    id: int
    supplier_name: str
    contact_email: Optional[EmailStr] = None
    contact_info: Optional[str] = None
    created_at: str  # Formatted date