from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationCreateViewModel(BaseModel):
    user_id: Optional[int] = None
    type: str
    title: str
    message: str
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None

class NotificationUpdateViewModel(BaseModel):
    is_read: Optional[bool] = None

class NotificationViewModel(BaseModel):
    id: int
    user_id: Optional[int]
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    resource_type: Optional[str]
    resource_id: Optional[int]

    class Config:
        from_attributes = True
