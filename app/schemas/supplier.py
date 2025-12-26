from pydantic import BaseModel
from typing import Optional

class SupplierBase(BaseModel):
    name: str
    contact_info: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True