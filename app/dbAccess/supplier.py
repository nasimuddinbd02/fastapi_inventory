from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate
import logging

db_logger = logging.getLogger("app.dbAccess.supplier")

async def get_supplier(db: AsyncSession, supplier_id: int):
    db_logger.debug(f"Querying supplier with ID: {supplier_id}")
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalars().first()
    if supplier:
        db_logger.debug(f"Supplier found: {supplier.name} (ID: {supplier_id})")
    else:
        db_logger.debug(f"Supplier not found: {supplier_id}")
    return supplier

def _supplier_search_filter(search: str | None):
    if not search:
        return None
    pattern = f"%{search.lower()}%"
    return or_(
        func.lower(Supplier.name).like(pattern),
        func.lower(Supplier.contact_info).like(pattern)
    )


async def get_suppliers(db: AsyncSession, skip: int = 0, limit: int = 100, search: str | None = None):
    db_logger.debug(f"Querying suppliers with skip={skip}, limit={limit}, search={search}")
    query = select(Supplier)
    search_filter = _supplier_search_filter(search.strip().lower() if search else None)
    if search_filter is not None:
        query = query.where(search_filter)
    result = await db.execute(query.offset(skip).limit(limit))
    suppliers = result.scalars().all()
    db_logger.debug(f"Retrieved {len(suppliers)} suppliers")
    return suppliers


async def count_suppliers(db: AsyncSession, search: str | None = None) -> int:
    db_logger.debug(f"Counting suppliers with search={search}")
    query = select(func.count(Supplier.id))
    search_filter = _supplier_search_filter(search.strip().lower() if search else None)
    if search_filter is not None:
        query = query.where(search_filter)
    result = await db.execute(query)
    total = result.scalar_one()
    db_logger.debug(f"Supplier count result: {total}")
    return total

async def create_supplier(db: AsyncSession, supplier: SupplierCreate):
    db_logger.debug(f"Creating supplier: {supplier.name}")
    db_supplier = Supplier(**supplier.model_dump())
    db.add(db_supplier)
    await db.commit()
    await db.refresh(db_supplier)
    db_logger.debug(f"Supplier created with ID: {db_supplier.id}")
    return db_supplier

async def update_supplier(db: AsyncSession, supplier_id: int, supplier: SupplierUpdate):
    db_logger.debug(f"Updating supplier {supplier_id}")
    db_supplier = await get_supplier(db, supplier_id)
    if db_supplier:
        for key, value in supplier.model_dump().items():
            setattr(db_supplier, key, value)
        await db.commit()
        await db.refresh(db_supplier)
        db_logger.debug(f"Supplier updated: {supplier_id}")
    else:
        db_logger.debug(f"Supplier not found for update: {supplier_id}")
    return db_supplier

async def get_supplier_by_name(db: AsyncSession, name: str):
    db_logger.debug(f"Querying supplier by name: {name}")
    result = await db.execute(select(Supplier).where(Supplier.name == name))
    supplier = result.scalars().first()
    if supplier:
        db_logger.debug(f"Supplier found by name: {name} (ID: {supplier.id})")
    else:
        db_logger.debug(f"Supplier not found by name: {name}")
    return supplier

async def delete_supplier(db: AsyncSession, supplier_id: int):
    db_logger.debug(f"Deleting supplier: {supplier_id}")
    db_supplier = await get_supplier(db, supplier_id)
    if db_supplier:
        await db.delete(db_supplier)
        await db.commit()
        db_logger.debug(f"Supplier deleted: {supplier_id}")
        return db_supplier
    db_logger.debug(f"Supplier not found for deletion: {supplier_id}")
    return None