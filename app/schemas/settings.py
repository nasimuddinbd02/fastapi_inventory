from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class SettingBase(BaseModel):
    key: str
    value: Optional[str] = None
    value_type: str = "string"
    category: str = "general"
    description: Optional[str] = None


class SettingCreate(SettingBase):
    pass


class SettingUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None


class Setting(SettingBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AppSettingsResponse(BaseModel):
    """Full application settings as a structured object"""
    # General Settings
    company_name: str = "My Company"
    admin_email: str = "admin@company.com"
    currency: str = "USD"
    date_format: str = "MM/DD/YYYY"

    # Inventory Settings
    low_stock_threshold: int = 10
    enable_low_stock_alerts: bool = True
    auto_generate_intake_number: bool = True
    auto_generate_dispatch_number: bool = True

    # Display Settings
    items_per_page: int = 10
    show_stock_value_in_dashboard: bool = True
    enable_dark_mode: bool = False

    # Notification Settings
    enable_email_notifications: bool = False
    enable_browser_notifications: bool = True
    notify_on_low_stock: bool = True
    notify_on_new_intake: bool = False
    notify_on_new_dispatch: bool = False

    model_config = ConfigDict(from_attributes=True)


class AppSettingsUpdate(BaseModel):
    """Update application settings"""
    # General Settings
    company_name: Optional[str] = None
    admin_email: Optional[str] = None
    currency: Optional[str] = None
    date_format: Optional[str] = None

    # Inventory Settings
    low_stock_threshold: Optional[int] = None
    enable_low_stock_alerts: Optional[bool] = None
    auto_generate_intake_number: Optional[bool] = None
    auto_generate_dispatch_number: Optional[bool] = None

    # Display Settings
    items_per_page: Optional[int] = None
    show_stock_value_in_dashboard: Optional[bool] = None
    enable_dark_mode: Optional[bool] = None

    # Notification Settings
    enable_email_notifications: Optional[bool] = None
    enable_browser_notifications: Optional[bool] = None
    notify_on_low_stock: Optional[bool] = None
    notify_on_new_intake: Optional[bool] = None
    notify_on_new_dispatch: Optional[bool] = None
