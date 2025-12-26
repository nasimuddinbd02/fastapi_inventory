from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
import logging

db_logger = logging.getLogger("app.dbAccess.product")

async def get_product(db: AsyncSession, product_id: int):
    db_logger.debug(f"Querying product with ID: {product_id}")
    result = await db.execute(
        select(Product)
        .options(joinedload(Product.category), joinedload(Product.supplier))
        .where(Product.id == product_id)
    )
    product = result.scalars().first()
    if product:
        db_logger.debug(f"Product found: {product.name} (ID: {product_id})")
    else:
        db_logger.debug(f"Product not found: {product_id}")
    return product

async def get_products(db: AsyncSession, skip: int = 0, limit: int = 100):
    db_logger.debug(f"Querying products with skip={skip}, limit={limit}")
    result = await db.execute(
        select(Product)
        .options(joinedload(Product.category), joinedload(Product.supplier))
        .offset(skip).limit(limit)
    )
    products = result.scalars().all()
    db_logger.debug(f"Retrieved {len(products)} products")
    return products

async def create_product(db: AsyncSession, product: ProductCreate):
    db_logger.debug(f"Creating product: {product.name}")
    db_product = Product(**product.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    db_logger.debug(f"Product created with ID: {db_product.id}")
    return db_product

async def update_product(db: AsyncSession, product_id: int, product: ProductUpdate):
    db_logger.debug(f"Updating product {product_id}")
    db_product = await get_product(db, product_id)
    if db_product:
        for key, value in product.model_dump().items():
            setattr(db_product, key, value)
        await db.commit()
        await db.refresh(db_product)
        db_logger.debug(f"Product updated: {product_id}")
    else:
        db_logger.debug(f"Product not found for update: {product_id}")
    return db_product

async def get_product_by_name(db: AsyncSession, name: str):
    db_logger.debug(f"Querying product by name: {name}")
    result = await db.execute(
        select(Product)
        .options(joinedload(Product.category), joinedload(Product.supplier))
        .where(Product.name == name)
    )
    product = result.scalars().first()
    if product:
        db_logger.debug(f"Product found by name: {name} (ID: {product.id})")
    else:
        db_logger.debug(f"Product not found by name: {name}")
    return product

async def delete_product(db: AsyncSession, product_id: int):
    db_logger.debug(f"Deleting product: {product_id}")
    db_product = await get_product(db, product_id)
    if db_product:
        await db.delete(db_product)
        await db.commit()
        db_logger.debug(f"Product deleted: {product_id}")
        return db_product
    db_logger.debug(f"Product not found for deletion: {product_id}")
    return None