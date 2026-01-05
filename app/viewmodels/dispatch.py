from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class DispatchItemViewModel(BaseModel):
    id: Optional[int] = None
    product_id: int
    product_title: Optional[str] = None
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    total_price: Decimal = Field(ge=0)

    class Config:
        from_attributes = True


class DispatchItemCreateViewModel(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0)


class DispatchOrderViewModel(BaseModel):
    id: int
    dispatch_number: str
    dispatch_date: datetime
    customer_name: Optional[str] = None
    status: str
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    items: List[DispatchItemViewModel] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DispatchOrderCreateViewModel(BaseModel):
    dispatch_date: Optional[datetime] = None
    customer_name: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    items: List[DispatchItemCreateViewModel] = Field(min_length=1)
    tax_rate: Optional[Decimal] = Field(default=Decimal("0.10"), ge=0)  # 10% default tax


class DispatchOrderUpdateViewModel(BaseModel):
    dispatch_date: Optional[datetime] = None
    customer_name: Optional[str] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[DispatchItemCreateViewModel]] = None
    tax_rate: Optional[Decimal] = Field(default=Decimal("0.10"), ge=0)
