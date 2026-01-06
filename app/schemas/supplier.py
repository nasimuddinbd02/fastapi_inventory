from pydantic import BaseModel, ConfigDict
from typing import Optional

class SupplierBase(BaseModel):
    name: str
    contact_info: Optional[str] = None
    contact_email: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int

    model_config = ConfigDict(from_attributes=True)