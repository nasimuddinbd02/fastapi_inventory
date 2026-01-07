from sqlalchemy.ext.asyncio import AsyncSession
from app.dbAccess.inventory import create_inventory as crud_create_inventory, get_inventory, update_inventory as crud_update_inventory, delete_inventory as crud_delete_inventory, get_inventories
from app.viewmodels.inventory import InventoryCreateViewModel, InventoryUpdateViewModel, InventoryViewModel
from app.mappers.inventory_mapper import (
    map_inventory_create_viewmodel_to_dto, map_inventory_update_viewmodel_to_dto,
    map_inventory_to_viewmodel
)
from app.exceptions import ValidationError, NotFoundError, BusinessLogicError
import logging

service_logger = logging.getLogger("app.services.inventory_service")

class InventoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        service_logger.debug("InventoryService initialized")

    async def create_inventory(self, inventory_viewmodel: InventoryCreateViewModel) -> InventoryViewModel:
        """Create inventory using ViewModel - business logic operates on ViewModel"""
        service_logger.info(f"Creating inventory for product ID: {inventory_viewmodel.product_id}")
        
        # Business logic: validate quantities
        if inventory_viewmodel.stock_quantity < 0:
            service_logger.warning(f"Invalid stock quantity for inventory creation: {inventory_viewmodel.stock_quantity}")
            raise ValidationError(
                message="Stock quantity cannot be negative",
                field="stock_quantity",
                details={"provided_value": inventory_viewmodel.stock_quantity}
            )

        service_logger.debug(f"Mapping inventory create viewmodel for product {inventory_viewmodel.product_id}")
        # Map ViewModel to DTO (this also validates product existence)
        try:
            inventory_dto = await map_inventory_create_viewmodel_to_dto(inventory_viewmodel, self.db)
        except Exception as e:
            service_logger.error(f"Failed to map inventory viewmodel for product {inventory_viewmodel.product_id}: {str(e)}")
            raise BusinessLogicError(
                message="Failed to create inventory due to invalid product reference",
                details={"product_id": inventory_viewmodel.product_id, "error": str(e)}
            )

        service_logger.debug(f"Creating inventory for product {inventory_viewmodel.product_id} in database")
        # Create inventory in database
        try:
            db_inventory = await crud_create_inventory(self.db, inventory_dto)
        except Exception as e:
            service_logger.error(f"Database error creating inventory for product {inventory_viewmodel.product_id}: {str(e)}")
            raise BusinessLogicError(
                message="Failed to create inventory in database",
                details={"product_id": inventory_viewmodel.product_id, "error": str(e)}
            )

        # Map back to ViewModel for response
        result = map_inventory_to_viewmodel(db_inventory)
        service_logger.info(f"Inventory created successfully: {result.id}")
        return result

    async def get_inventory(self, inventory_id: int) -> InventoryViewModel:
        """Get inventory by ID"""
        service_logger.info(f"Retrieving inventory with ID: {inventory_id}")
        try:
            inventory = await get_inventory(self.db, inventory_id)
            if not inventory:
                service_logger.warning(f"Inventory not found: {inventory_id}")
                raise NotFoundError(
                    resource="Inventory",
                    resource_id=inventory_id
                )
            result = map_inventory_to_viewmodel(inventory)
            service_logger.info(f"Inventory retrieved: {inventory_id}")
            return result
        except NotFoundError:
            raise
        except Exception as e:
            service_logger.error(f"Database error retrieving inventory {inventory_id}: {str(e)}")
            raise BusinessLogicError(
                message="Failed to retrieve inventory",
                details={"inventory_id": inventory_id, "error": str(e)}
            )

    async def get_inventories(self, skip: int = 0, limit: int = 100) -> list[InventoryViewModel]:
        """Get list of inventories"""
        service_logger.info(f"Retrieving inventories with skip={skip}, limit={limit}")
        inventories = await get_inventories(self.db, skip, limit)
        results = [map_inventory_to_viewmodel(inventory) for inventory in inventories]
        service_logger.info(f"Retrieved {len(results)} inventories")
        return results

    async def update_inventory(self, inventory_id: int, inventory_viewmodel: InventoryUpdateViewModel) -> InventoryViewModel:
        """Update inventory using ViewModel"""
        service_logger.info(f"Updating inventory {inventory_id}")
        
        # Business logic: validate quantities if provided
        if inventory_viewmodel.stock_quantity is not None and inventory_viewmodel.stock_quantity < 0:
            service_logger.warning(f"Invalid stock quantity for inventory update {inventory_id}: {inventory_viewmodel.stock_quantity}")
            raise ValidationError(
                message="Stock quantity cannot be negative",
                field="stock_quantity",
                details={"provided_value": inventory_viewmodel.stock_quantity}
            )

        service_logger.debug(f"Mapping inventory update {inventory_id} to DTO")
        # Map ViewModel to DTO (validates product if name provided)
        try:
            inventory_dto = map_inventory_update_viewmodel_to_dto(inventory_viewmodel)
        except Exception as e:
            service_logger.error(f"Failed to map inventory update viewmodel for inventory {inventory_id}: {str(e)}")
            raise BusinessLogicError(
                message="Failed to update inventory due to invalid data",
                details={"inventory_id": inventory_id, "error": str(e)}
            )

        service_logger.debug(f"Updating inventory {inventory_id} in database")
        # Update in database
        try:
            updated_inventory = await crud_update_inventory(self.db, inventory_id, inventory_dto)
            if not updated_inventory:
                service_logger.warning(f"Inventory not found for update: {inventory_id}")
                raise NotFoundError(
                    resource="Inventory",
                    resource_id=inventory_id
                )

            result = map_inventory_to_viewmodel(updated_inventory)
            service_logger.info(f"Inventory updated successfully: {inventory_id}")
            return result
        except NotFoundError:
            raise
        except Exception as e:
            service_logger.error(f"Database error updating inventory {inventory_id}: {str(e)}")
            raise BusinessLogicError(
                message="Failed to update inventory in database",
                details={"inventory_id": inventory_id, "error": str(e)}
            )

    async def delete_inventory(self, inventory_id: int) -> bool:
        """Delete inventory"""
        service_logger.info(f"Deleting inventory: {inventory_id}")
        try:
            deleted = await crud_delete_inventory(self.db, inventory_id)
            if deleted:
                service_logger.info(f"Inventory deleted successfully: {inventory_id}")
                return True
            else:
                service_logger.warning(f"Inventory not found for deletion: {inventory_id}")
                raise NotFoundError(
                    resource="Inventory",
                    resource_id=inventory_id
                )
        except NotFoundError:
            raise
        except Exception as e:
            service_logger.error(f"Database error deleting inventory {inventory_id}: {str(e)}")
            raise BusinessLogicError(
                message="Failed to delete inventory",
                details={"inventory_id": inventory_id, "error": str(e)}
            )