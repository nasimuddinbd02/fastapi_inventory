from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from app.models.settings import AppSettings
from app.schemas.settings import SettingCreate, SettingUpdate
import logging

db_logger = logging.getLogger("app.dbAccess.settings")


# Default settings configuration
DEFAULT_SETTINGS = [
    # General Settings
    {"key": "company_name", "value": "My Company", "value_type": "string", "category": "general", "description": "Company name displayed in the application"},
    {"key": "admin_email", "value": "admin@company.com", "value_type": "string", "category": "general", "description": "Administrator email for support and contact"},
    {"key": "currency", "value": "USD", "value_type": "string", "category": "general", "description": "Default currency for prices"},
    {"key": "date_format", "value": "MM/DD/YYYY", "value_type": "string", "category": "general", "description": "Date format for displaying dates"},
    
    # Inventory Settings
    {"key": "low_stock_threshold", "value": "10", "value_type": "integer", "category": "inventory", "description": "Threshold below which items are marked as low stock"},
    {"key": "enable_low_stock_alerts", "value": "true", "value_type": "boolean", "category": "inventory", "description": "Enable alerts for low stock items"},
    {"key": "auto_generate_intake_number", "value": "true", "value_type": "boolean", "category": "inventory", "description": "Automatically generate intake order numbers"},
    {"key": "auto_generate_dispatch_number", "value": "true", "value_type": "boolean", "category": "inventory", "description": "Automatically generate dispatch order numbers"},
    
    # Display Settings
    {"key": "items_per_page", "value": "10", "value_type": "integer", "category": "display", "description": "Number of items to display per page"},
    {"key": "show_stock_value_in_dashboard", "value": "true", "value_type": "boolean", "category": "display", "description": "Show total inventory value on dashboard"},
    {"key": "enable_dark_mode", "value": "false", "value_type": "boolean", "category": "display", "description": "Enable dark theme"},
    
    # Notification Settings
    {"key": "enable_email_notifications", "value": "false", "value_type": "boolean", "category": "notification", "description": "Receive notifications via email"},
    {"key": "enable_browser_notifications", "value": "true", "value_type": "boolean", "category": "notification", "description": "Show browser push notifications"},
    {"key": "notify_on_low_stock", "value": "true", "value_type": "boolean", "category": "notification", "description": "Notify when items fall below threshold"},
    {"key": "notify_on_new_intake", "value": "false", "value_type": "boolean", "category": "notification", "description": "Notify when new intake order is created"},
    {"key": "notify_on_new_dispatch", "value": "false", "value_type": "boolean", "category": "notification", "description": "Notify when new dispatch order is created"},
]


async def initialize_default_settings(db: AsyncSession):
    """Initialize default settings if they don't exist"""
    db_logger.info("Initializing default settings")
    for setting_data in DEFAULT_SETTINGS:
        existing = await get_setting_by_key(db, setting_data["key"])
        if not existing:
            setting = AppSettings(**setting_data)
            db.add(setting)
            db_logger.debug(f"Created default setting: {setting_data['key']}")
    await db.commit()
    db_logger.info("Default settings initialized")


async def get_setting_by_key(db: AsyncSession, key: str) -> AppSettings | None:
    """Get a single setting by key"""
    db_logger.debug(f"Querying setting by key: {key}")
    result = await db.execute(select(AppSettings).where(AppSettings.key == key))
    setting = result.scalars().first()
    return setting


async def get_all_settings(db: AsyncSession) -> list[AppSettings]:
    """Get all settings"""
    db_logger.debug("Querying all settings")
    result = await db.execute(select(AppSettings).order_by(AppSettings.category, AppSettings.key))
    settings = result.scalars().all()
    db_logger.debug(f"Retrieved {len(settings)} settings")
    return settings


async def get_settings_by_category(db: AsyncSession, category: str) -> list[AppSettings]:
    """Get settings filtered by category"""
    db_logger.debug(f"Querying settings by category: {category}")
    result = await db.execute(
        select(AppSettings).where(AppSettings.category == category).order_by(AppSettings.key)
    )
    settings = result.scalars().all()
    db_logger.debug(f"Retrieved {len(settings)} settings for category {category}")
    return settings


async def update_setting(db: AsyncSession, key: str, value: str) -> AppSettings | None:
    """Update a setting value by key"""
    db_logger.debug(f"Updating setting: {key} = {value}")
    setting = await get_setting_by_key(db, key)
    if setting:
        setting.value = value
        await db.commit()
        await db.refresh(setting)
        db_logger.debug(f"Setting {key} updated successfully")
    else:
        db_logger.warning(f"Setting {key} not found for update")
    return setting


async def update_settings_bulk(db: AsyncSession, settings_dict: dict[str, str]) -> list[AppSettings]:
    """Update multiple settings at once"""
    db_logger.info(f"Bulk updating {len(settings_dict)} settings")
    updated_settings = []
    for key, value in settings_dict.items():
        setting = await update_setting(db, key, value)
        if setting:
            updated_settings.append(setting)
    db_logger.info(f"Bulk update completed, {len(updated_settings)} settings updated")
    return updated_settings


async def create_setting(db: AsyncSession, setting: SettingCreate) -> AppSettings:
    """Create a new setting"""
    db_logger.debug(f"Creating setting: {setting.key}")
    db_setting = AppSettings(**setting.model_dump())
    db.add(db_setting)
    await db.commit()
    await db.refresh(db_setting)
    db_logger.debug(f"Setting created with ID: {db_setting.id}")
    return db_setting


async def delete_setting(db: AsyncSession, key: str) -> bool:
    """Delete a setting by key"""
    db_logger.debug(f"Deleting setting: {key}")
    setting = await get_setting_by_key(db, key)
    if setting:
        await db.delete(setting)
        await db.commit()
        db_logger.debug(f"Setting {key} deleted successfully")
        return True
    db_logger.warning(f"Setting {key} not found for deletion")
    return False
