from sqlalchemy.ext.asyncio import AsyncSession
from app.dbAccess.settings import (
    get_all_settings,
    get_setting_by_key,
    update_setting,
    update_settings_bulk,
    initialize_default_settings,
)
from app.schemas.settings import AppSettingsResponse, AppSettingsUpdate
import logging

service_logger = logging.getLogger("app.services.settings")


def _parse_value(value: str | None, value_type: str):
    """Parse string value to appropriate type"""
    if value is None:
        return None
    if value_type == "boolean":
        return value.lower() in ("true", "1", "yes")
    if value_type == "integer":
        return int(value)
    if value_type == "float":
        return float(value)
    return value


def _serialize_value(value) -> str:
    """Serialize value to string for storage"""
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


class SettingsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        service_logger.debug("SettingsService initialized")

    async def initialize_settings(self):
        """Initialize default settings if not present"""
        service_logger.info("Initializing application settings")
        await initialize_default_settings(self.db)

    async def get_all_settings(self) -> AppSettingsResponse:
        """Get all settings as structured response"""
        service_logger.debug("Getting all application settings")
        settings = await get_all_settings(self.db)

        # Build response from settings
        settings_dict = {}
        for setting in settings:
            settings_dict[setting.key] = _parse_value(setting.value, setting.value_type)

        # Create response with defaults for any missing settings
        response = AppSettingsResponse(
            company_name=settings_dict.get("company_name", "My Company"),
            admin_email=settings_dict.get("admin_email", "admin@company.com"),
            currency=settings_dict.get("currency", "USD"),
            date_format=settings_dict.get("date_format", "MM/DD/YYYY"),
            low_stock_threshold=settings_dict.get("low_stock_threshold", 10),
            enable_low_stock_alerts=settings_dict.get("enable_low_stock_alerts", True),
            auto_generate_intake_number=settings_dict.get("auto_generate_intake_number", True),
            auto_generate_dispatch_number=settings_dict.get("auto_generate_dispatch_number", True),
            items_per_page=settings_dict.get("items_per_page", 10),
            show_stock_value_in_dashboard=settings_dict.get("show_stock_value_in_dashboard", True),
            enable_dark_mode=settings_dict.get("enable_dark_mode", False),
            enable_email_notifications=settings_dict.get("enable_email_notifications", False),
            enable_browser_notifications=settings_dict.get("enable_browser_notifications", True),
            notify_on_low_stock=settings_dict.get("notify_on_low_stock", True),
            notify_on_new_intake=settings_dict.get("notify_on_new_intake", False),
            notify_on_new_dispatch=settings_dict.get("notify_on_new_dispatch", False),
        )

        service_logger.debug("Application settings retrieved successfully")
        return response

    async def update_settings(self, settings_update: AppSettingsUpdate) -> AppSettingsResponse:
        """Update multiple settings at once"""
        service_logger.info("Updating application settings")
        
        # Build updates dictionary
        updates = {}
        update_data = settings_update.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            if value is not None:
                updates[key] = _serialize_value(value)
                service_logger.debug(f"Setting {key} to be updated to: {value}")

        if updates:
            await update_settings_bulk(self.db, updates)
            service_logger.info(f"Updated {len(updates)} settings")

        # Return updated settings
        return await self.get_all_settings()

    async def get_setting(self, key: str):
        """Get a single setting value"""
        service_logger.debug(f"Getting setting: {key}")
        setting = await get_setting_by_key(self.db, key)
        if setting:
            return _parse_value(setting.value, setting.value_type)
        return None

    async def update_single_setting(self, key: str, value) -> bool:
        """Update a single setting"""
        service_logger.info(f"Updating single setting: {key}")
        serialized = _serialize_value(value)
        result = await update_setting(self.db, key, serialized)
        return result is not None
