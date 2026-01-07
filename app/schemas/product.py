from pydantic import BaseModel, ConfigDict
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

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None

class Product(ProductBase):
    id: int
    category: Optional[Category] = None
    supplier: Optional[Supplier] = None

    model_config = ConfigDict(from_attributes=True)