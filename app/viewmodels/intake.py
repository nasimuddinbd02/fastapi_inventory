from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class IntakeItemViewModel(BaseModel):
    id: Optional[int] = None
    product_id: int
    product_title: Optional[str] = None
    quantity: int = Field(gt=0)
    unit_cost: Decimal = Field(ge=0)
    total_cost: Decimal = Field(ge=0)

    class Config:
        from_attributes = True


class IntakeItemCreateViewModel(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_cost: Decimal = Field(ge=0)


class IntakeOrderViewModel(BaseModel):
    id: int
    intake_number: str
    intake_date: datetime
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    status: str
    total_cost: Decimal
    notes: Optional[str] = None
    items: List[IntakeItemViewModel] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IntakeOrderCreateViewModel(BaseModel):
    intake_date: Optional[datetime] = None
    supplier_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    items: List[IntakeItemCreateViewModel] = Field(min_length=1)


class IntakeOrderUpdateViewModel(BaseModel):
    intake_date: Optional[datetime] = None
    supplier_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[IntakeItemCreateViewModel]] = None
