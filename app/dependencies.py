from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.category_service import CategoryService
from app.services.supplier_service import SupplierService
from app.services.product_service import ProductService
from app.services.inventory_service import InventoryService
from app.services.user_service import UserService
from app.services.agent_service import AgentService
from app.services.dispatch_service import DispatchService
from app.services.intake_service import IntakeService
from app.services.settings_service import SettingsService

def get_category_service(db: AsyncSession = Depends(get_db)):
    return CategoryService(db)

def get_supplier_service(db: AsyncSession = Depends(get_db)):
    return SupplierService(db)

def get_product_service(db: AsyncSession = Depends(get_db)):
    return ProductService(db)

def get_inventory_service(db: AsyncSession = Depends(get_db)):
    return InventoryService(db)

def get_user_service(db: AsyncSession = Depends(get_db)):
    return UserService(db)

def get_dispatch_service(db: AsyncSession = Depends(get_db)):
    return DispatchService(db)

def get_intake_service(db: AsyncSession = Depends(get_db)):
    return IntakeService(db)

def get_settings_service(db: AsyncSession = Depends(get_db)):
    return SettingsService(db)

# Agent service - singleton instance (no database dependency)
_agent_service_instance = None

def get_agent_service() -> AgentService:
    global _agent_service_instance
    if _agent_service_instance is None:
        _agent_service_instance = AgentService()
    return _agent_service_instance