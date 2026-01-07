from app.viewmodels.inventory import (
    InventoryCreateViewModel, InventoryUpdateViewModel, InventoryViewModel
)
from app.schemas.inventory import InventoryCreate, InventoryUpdate, Inventory
from app.dbAccess.product import get_product_by_name
from sqlalchemy.ext.asyncio import AsyncSession
import logging


mapper_logger = logging.getLogger("app.mappers.inventory_mapper")

async def map_inventory_create_viewmodel_to_dto(viewmodel: InventoryCreateViewModel, db: AsyncSession) -> InventoryCreate:
    """Map InventoryCreateViewModel to InventoryCreate DTO using py-automapper - resolve product name to ID"""
    mapper_logger.debug(f"Mapping inventory create viewmodel for product: {viewmodel.product_title}")
    
    # Find product by name
    product = await get_product_by_name(db, viewmodel.product_title)
    if not product:
        mapper_logger.error(f"Product not found for inventory creation: {viewmodel.product_title}")
        raise ValueError(f"Product '{viewmodel.product_title}' not found")

    # Use py-automapper for basic mapping
    result = InventoryCreate(
        quantity=viewmodel.stock_quantity,
        location=viewmodel.warehouse_location,
        product_id=product.id
    )
    mapper_logger.debug(f"Inventory create viewmodel mapped successfully for product: {viewmodel.product_title}")
    return result


def map_inventory_update_viewmodel_to_dto(viewmodel: InventoryUpdateViewModel) -> InventoryUpdate:
    """Map InventoryUpdateViewModel to InventoryUpdate DTO using py-automapper"""
    mapper_logger.debug("Mapping inventory update viewmodel")
    update_data = {}

    if viewmodel.stock_quantity is not None:
        update_data["quantity"] = viewmodel.stock_quantity
    if viewmodel.warehouse_location is not None:
        update_data["location"] = viewmodel.warehouse_location

    result = InventoryUpdate(**update_data)
    mapper_logger.debug("Inventory update viewmodel mapped successfully")
    return result

def map_inventory_to_viewmodel(inventory: Inventory) -> InventoryViewModel:
    """Map Inventory DTO to InventoryViewModel using py-automapper"""
    mapper_logger.debug(f"Mapping inventory to viewmodel: {inventory.id}")
    result = InventoryViewModel(
        id=inventory.id,
        stock_quantity=inventory.quantity,
        warehouse_location=inventory.location,
        product_id=inventory.product_id,  # Use product_id instead of full product
        created_at="N/A"  # Inventory doesn't have timestamps
    )
    mapper_logger.debug(f"Inventory mapped to viewmodel: {inventory.id}")
    return result