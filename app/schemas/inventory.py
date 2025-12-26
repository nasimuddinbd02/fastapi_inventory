from pydantic import BaseModel
from typing import Optional
from .product import Product

class InventoryBase(BaseModel):
    product_id: int
    quantity: float
    location: Optional[str] = None

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(InventoryBase):
    pass

class Inventory(InventoryBase):
    id: int
    product: Optional[Product] = None

    class Config:
        from_attributes = True