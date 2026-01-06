from fastapi import APIRouter, Depends, HTTPException
from app.schemas.settings import AppSettingsResponse, AppSettingsUpdate
from app.services.settings_service import SettingsService
from app.dependencies import get_settings_service
import logging

router_logger = logging.getLogger("app.routers.settings")

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/", response_model=AppSettingsResponse)
async def get_settings(service: SettingsService = Depends(get_settings_service)):
    """Get all application settings"""
    router_logger.info("Fetching application settings")
    try:
        settings = await service.get_all_settings()
        router_logger.info("Application settings retrieved successfully")
        return settings
    except Exception as e:
        router_logger.error(f"Failed to fetch settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve settings")


@router.put("/", response_model=AppSettingsResponse)
async def update_settings(
    settings_update: AppSettingsUpdate,
    service: SettingsService = Depends(get_settings_service)
):
    """Update application settings"""
    router_logger.info("Updating application settings")
    try:
        updated = await service.update_settings(settings_update)
        router_logger.info("Application settings updated successfully")
        return updated
    except Exception as e:
        router_logger.error(f"Failed to update settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update settings")


@router.get("/{key}")
async def get_setting(key: str, service: SettingsService = Depends(get_settings_service)):
    """Get a single setting by key"""
    router_logger.info(f"Fetching setting: {key}")
    value = await service.get_setting(key)
    if value is None:
        router_logger.warning(f"Setting not found: {key}")
        raise HTTPException(status_code=404, detail=f"Setting '{key}' not found")
    return {"key": key, "value": value}


@router.post("/initialize")
async def initialize_settings(service: SettingsService = Depends(get_settings_service)):
    """Initialize default settings (idempotent)"""
    router_logger.info("Initializing default settings")
    await service.initialize_settings()
    return {"message": "Settings initialized successfully"}
