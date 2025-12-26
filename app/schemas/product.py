from pydantic import BaseModel
from typing import Optional
from .category import Category
from .supplier import Supplier

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    supplier_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    category: Optional[Category] = None
    supplier: Optional[Supplier] = None

    class Config:
        from_attributes = True