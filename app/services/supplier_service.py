from sqlalchemy.ext.asyncio import AsyncSession
from app.dbAccess.supplier import create_supplier as crud_create_supplier, get_supplier, update_supplier as crud_update_supplier, delete_supplier as crud_delete_supplier, get_suppliers, get_supplier_by_name
from app.viewmodels.supplier import SupplierCreateViewModel, SupplierUpdateViewModel, SupplierViewModel
from app.mappers.supplier_mapper import (
    map_supplier_create_viewmodel_to_dto, map_supplier_update_viewmodel_to_dto,
    map_supplier_to_viewmodel
)
import logging

service_logger = logging.getLogger("app.services.supplier_service")

class SupplierService:
    def __init__(self, db: AsyncSession):
        self.db = db
        service_logger.debug("SupplierService initialized")

    async def create_supplier(self, supplier_viewmodel: SupplierCreateViewModel) -> SupplierViewModel:
        """Create supplier using ViewModel - business logic operates on ViewModel"""
        service_logger.info(f"Creating supplier: {supplier_viewmodel.supplier_name}")
        
        # Business logic: check if supplier name already exists
        existing_supplier = await get_supplier_by_name(self.db, supplier_viewmodel.supplier_name)
        if existing_supplier:
            service_logger.warning(f"Supplier name already exists: {supplier_viewmodel.supplier_name}")
            raise ValueError("Supplier name already exists")

        service_logger.debug(f"Mapping supplier '{supplier_viewmodel.supplier_name}' to DTO")
        # Map ViewModel to DTO for database operations
        supplier_dto = map_supplier_create_viewmodel_to_dto(supplier_viewmodel)

        service_logger.debug(f"Creating supplier '{supplier_viewmodel.supplier_name}' in database")
        # Create supplier in database
        db_supplier = await crud_create_supplier(self.db, supplier_dto)

        # Map back to ViewModel for response
        result = map_supplier_to_viewmodel(db_supplier)
        service_logger.info(f"Supplier created successfully: {result.supplier_name} (ID: {result.id})")
        return result

    async def get_supplier(self, supplier_id: int) -> SupplierViewModel:
        """Get supplier by ID"""
        service_logger.info(f"Retrieving supplier with ID: {supplier_id}")
        supplier = await get_supplier(self.db, supplier_id)
        if not supplier:
            service_logger.warning(f"Supplier not found: {supplier_id}")
            return None
        result = map_supplier_to_viewmodel(supplier)
        service_logger.info(f"Supplier retrieved: {result.supplier_name}")
        return result

    async def get_suppliers(self, skip: int = 0, limit: int = 100) -> list[SupplierViewModel]:
        """Get list of suppliers"""
        service_logger.info(f"Retrieving suppliers with skip={skip}, limit={limit}")
        suppliers = await get_suppliers(self.db, skip, limit)
        results = [map_supplier_to_viewmodel(supplier) for supplier in suppliers]
        service_logger.info(f"Retrieved {len(results)} suppliers")
        return results

    async def update_supplier(self, supplier_id: int, supplier_viewmodel: SupplierUpdateViewModel) -> SupplierViewModel:
        """Update supplier using ViewModel"""
        service_logger.info(f"Updating supplier {supplier_id}")
        
        # Business logic: check if updating to existing name
        if supplier_viewmodel.supplier_name:
            existing = await get_supplier_by_name(self.db, supplier_viewmodel.supplier_name)
            if existing and existing.id != supplier_id:
                service_logger.warning(f"Supplier name already exists for update {supplier_id}: {supplier_viewmodel.supplier_name}")
                raise ValueError("Supplier name already exists")

        service_logger.debug(f"Mapping supplier update {supplier_id} to DTO")
        # Map ViewModel to DTO
        supplier_dto = map_supplier_update_viewmodel_to_dto(supplier_viewmodel)

        service_logger.debug(f"Updating supplier {supplier_id} in database")
        # Update in database
        updated_supplier = await crud_update_supplier(self.db, supplier_id, supplier_dto)
        if not updated_supplier:
            service_logger.warning(f"Supplier not found for update: {supplier_id}")
            return None

        result = map_supplier_to_viewmodel(updated_supplier)
        service_logger.info(f"Supplier updated successfully: {result.supplier_name} (ID: {supplier_id})")
        return result

    async def delete_supplier(self, supplier_id: int) -> bool:
        """Delete supplier"""
        service_logger.info(f"Deleting supplier: {supplier_id}")
        deleted = await crud_delete_supplier(self.db, supplier_id)
        if deleted:
            service_logger.info(f"Supplier deleted successfully: {supplier_id}")
        else:
            service_logger.warning(f"Supplier not found for deletion: {supplier_id}")
        return deleted is not None