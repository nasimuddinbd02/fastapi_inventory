from fastapi import APIRouter, Depends
from app.viewmodels.inventory import InventoryViewModel, InventoryCreateViewModel, InventoryUpdateViewModel
from app.services.inventory_service import InventoryService
from app.dependencies import get_inventory_service
import logging

router_logger = logging.getLogger("app.routers.inventory")

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.post("/", response_model=InventoryViewModel)
async def create_inventory(inventory: InventoryCreateViewModel, service: InventoryService = Depends(get_inventory_service)):
    router_logger.info(f"Creating inventory for product ID: {inventory.product_id}")
    result = await service.create_inventory(inventory)
    router_logger.info(f"Inventory created successfully: {result.id}")
    return result

@router.get("/{inventory_id}", response_model=InventoryViewModel)
async def read_inventory(inventory_id: int, service: InventoryService = Depends(get_inventory_service)):
    router_logger.info(f"Fetching inventory with ID: {inventory_id}")
    inventory = await service.get_inventory(inventory_id)
    router_logger.info(f"Inventory retrieved: {inventory_id}")
    return inventory

@router.get("/", response_model=list[InventoryViewModel])
async def read_inventories(skip: int = 0, limit: int = 100, service: InventoryService = Depends(get_inventory_service)):
    router_logger.info(f"Fetching inventories with skip={skip}, limit={limit}")
    inventories = await service.get_inventories(skip, limit)
    router_logger.info(f"Retrieved {len(inventories)} inventories")
    return inventories

@router.put("/{inventory_id}", response_model=InventoryViewModel)
async def update_inventory(inventory_id: int, inventory: InventoryUpdateViewModel, service: InventoryService = Depends(get_inventory_service)):
    router_logger.info(f"Updating inventory {inventory_id}")
    updated = await service.update_inventory(inventory_id, inventory)
    router_logger.info(f"Inventory updated successfully: {inventory_id}")
    return updated

@router.delete("/{inventory_id}")
async def delete_inventory(inventory_id: int, service: InventoryService = Depends(get_inventory_service)):
    router_logger.info(f"Deleting inventory: {inventory_id}")
    await service.delete_inventory(inventory_id)
    router_logger.info(f"Inventory deleted successfully: {inventory_id}")
    return {"message": "Inventory deleted"}