from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
import logging

db_logger = logging.getLogger("app.dbAccess.category")

async def get_category(db: AsyncSession, category_id: int):
    db_logger.debug(f"Querying category by ID: {category_id}")
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalars().first()
    db_logger.debug(f"Category query result: {'found' if category else 'not found'}")
    return category

async def get_categories(db: AsyncSession, skip: int = 0, limit: int = 100):
    db_logger.debug(f"Querying categories with skip={skip}, limit={limit}")
    result = await db.execute(select(Category).offset(skip).limit(limit))
    categories = result.scalars().all()
    db_logger.debug(f"Categories query returned {len(categories)} results")
    return categories

async def create_category(db: AsyncSession, category: CategoryCreate):
    db_logger.debug(f"Creating category: {category.name}")
    db_category = Category(**category.model_dump())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    db_logger.debug(f"Category created with ID: {db_category.id}")
    return db_category

async def update_category(db: AsyncSession, category_id: int, category: CategoryUpdate):
    db_logger.debug(f"Updating category {category_id}")
    db_category = await get_category(db, category_id)
    if db_category:
        for key, value in category.model_dump().items():
            db_logger.debug(f"Updating field {key} to {value}")
            setattr(db_category, key, value)
        await db.commit()
        await db.refresh(db_category)
        db_logger.debug(f"Category {category_id} updated successfully")
    else:
        db_logger.debug(f"Category {category_id} not found for update")
    return db_category

async def get_category_by_name(db: AsyncSession, name: str):
    db_logger.debug(f"Querying category by name: {name}")
    result = await db.execute(select(Category).where(Category.name == name))
    category = result.scalars().first()
    db_logger.debug(f"Category by name query result: {'found' if category else 'not found'}")
    return category

async def delete_category(db: AsyncSession, category_id: int):
    db_logger.debug(f"Deleting category: {category_id}")
    db_category = await get_category(db, category_id)
    if db_category:
        await db.delete(db_category)
        await db.commit()
        db_logger.debug(f"Category {category_id} deleted successfully")
        return db_category
    db_logger.debug(f"Category {category_id} not found for deletion")
    return None