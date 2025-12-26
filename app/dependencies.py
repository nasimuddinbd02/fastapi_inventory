from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.category_service import CategoryService
from app.services.supplier_service import SupplierService
from app.services.product_service import ProductService
from app.services.inventory_service import InventoryService
from app.services.user_service import UserService

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