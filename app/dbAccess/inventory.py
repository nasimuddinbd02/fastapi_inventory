from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from app.models.inventory import Inventory
from app.models.product import Product
from app.schemas.inventory import InventoryCreate, InventoryUpdate
import logging

db_logger = logging.getLogger("app.dbAccess.inventory")

async def get_inventory(db: AsyncSession, inventory_id: int):
    db_logger.debug(f"Querying inventory with ID: {inventory_id}")
    result = await db.execute(
        select(Inventory)
        .where(Inventory.id == inventory_id)
    )
    inventory = result.scalars().first()
    if inventory:
        db_logger.debug(f"Inventory found: {inventory_id}")
    else:
        db_logger.debug(f"Inventory not found: {inventory_id}")
    return inventory

async def get_inventories(db: AsyncSession, skip: int = 0, limit: int = 100):
    db_logger.debug(f"Querying inventories with skip={skip}, limit={limit}")
    result = await db.execute(
        select(Inventory)
        .offset(skip).limit(limit)
    )
    inventories = result.scalars().all()
    db_logger.debug(f"Retrieved {len(inventories)} inventories")
    return inventories

async def create_inventory(db: AsyncSession, inventory: InventoryCreate):
    db_logger.debug(f"Creating inventory for product ID: {inventory.product_id}")
    db_inventory = Inventory(**inventory.model_dump())
    db.add(db_inventory)
    await db.commit()
    await db.refresh(db_inventory)
    db_logger.debug(f"Inventory created with ID: {db_inventory.id}")
    return db_inventory

async def update_inventory(db: AsyncSession, inventory_id: int, inventory: InventoryUpdate):
    db_logger.debug(f"Updating inventory {inventory_id}")
    db_inventory = await get_inventory(db, inventory_id)
    if db_inventory:
        for key, value in inventory.model_dump().items():
            setattr(db_inventory, key, value)
        await db.commit()
        await db.refresh(db_inventory)
        db_logger.debug(f"Inventory updated: {inventory_id}")
    else:
        db_logger.debug(f"Inventory not found for update: {inventory_id}")
    return db_inventory

async def delete_inventory(db: AsyncSession, inventory_id: int):
    db_logger.debug(f"Deleting inventory: {inventory_id}")
    db_inventory = await get_inventory(db, inventory_id)
    if db_inventory:
        await db.delete(db_inventory)
        await db.commit()
        db_logger.debug(f"Inventory deleted: {inventory_id}")
        return db_inventory
    db_logger.debug(f"Inventory not found for deletion: {inventory_id}")
    return None