from fastapi import APIRouter, HTTPException, Depends
from app.viewmodels.inventory import InventoryViewModel, InventoryCreateViewModel, InventoryUpdateViewModel
from app.services.inventory_service import InventoryService
from app.dependencies import get_inventory_service
import logging

router_logger = logging.getLogger("app.routers.inventory")

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.post("/", response_model=InventoryViewModel)
async def create_inventory(inventory: InventoryCreateViewModel, service: InventoryService = Depends(get_inventory_service)):
    router_logger.info(f"Creating inventory for product ID: {inventory.product_id}")
    try:
        result = await service.create_inventory(inventory)
        router_logger.info(f"Inventory created successfully: {result.id}")
        return result
    except Exception as e:
        router_logger.error(f"Failed to create inventory for product {inventory.product_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{inventory_id}", response_model=InventoryViewModel)
async def read_inventory(inventory_id: int, service: InventoryService = Depends(get_inventory_service)):
    router_logger.info(f"Fetching inventory with ID: {inventory_id}")
    inventory = await service.get_inventory(inventory_id)
    if not inventory:
        router_logger.warning(f"Inventory not found: {inventory_id}")
        raise HTTPException(status_code=404, detail="Inventory not found")
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
    try:
        updated = await service.update_inventory(inventory_id, inventory)
        if not updated:
            router_logger.warning(f"Inventory not found for update: {inventory_id}")
            raise HTTPException(status_code=404, detail="Inventory not found")
        router_logger.info(f"Inventory updated successfully: {inventory_id}")
        return updated
    except Exception as e:
        router_logger.error(f"Failed to update inventory {inventory_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{inventory_id}")
async def delete_inventory(inventory_id: int, service: InventoryService = Depends(get_inventory_service)):
    router_logger.info(f"Deleting inventory: {inventory_id}")
    deleted = await service.delete_inventory(inventory_id)
    if not deleted:
        router_logger.warning(f"Inventory not found for deletion: {inventory_id}")
        raise HTTPException(status_code=404, detail="Inventory not found")
    router_logger.info(f"Inventory deleted successfully: {inventory_id}")
    return {"message": "Inventory deleted"}