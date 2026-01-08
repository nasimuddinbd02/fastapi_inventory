from app.viewmodels.product import (
    ProductCreateViewModel, ProductUpdateViewModel, ProductViewModel
)
from app.schemas.product import ProductCreate, ProductUpdate, Product
from app.dbAccess.category import get_category_by_name
from app.dbAccess.supplier import get_supplier_by_name
from app.mappers.category_mapper import map_category_to_viewmodel
from app.mappers.supplier_mapper import map_supplier_to_viewmodel
from sqlalchemy.ext.asyncio import AsyncSession
import logging


mapper_logger = logging.getLogger("app.mappers.product_mapper")

async def map_product_create_viewmodel_to_dto(viewmodel: ProductCreateViewModel, db: AsyncSession) -> ProductCreate:
    """Map ProductCreateViewModel to ProductCreate DTO using py-automapper - resolve names to IDs"""
    mapper_logger.debug(f"Mapping product create viewmodel: {viewmodel.product_title}")
    
    # Find category by name
    category = await get_category_by_name(db, viewmodel.category_name)
    if not category:
        mapper_logger.error(f"Category not found for product creation: {viewmodel.category_name}")
        raise ValueError(f"Category '{viewmodel.category_name}' not found")

    # Find supplier by name
    supplier = await get_supplier_by_name(db, viewmodel.supplier_name)
    if not supplier:
        mapper_logger.error(f"Supplier not found for product creation: {viewmodel.supplier_name}")
        raise ValueError(f"Supplier '{viewmodel.supplier_name}' not found")

    # Use py-automapper for basic mapping
    result = ProductCreate(
        name=viewmodel.product_title,
        description=viewmodel.product_description,
        price=viewmodel.unit_price,
        category_id=category.id,
        supplier_id=supplier.id
    )
    mapper_logger.debug(f"Product create viewmodel mapped successfully: {viewmodel.product_title}")
    return result

async def map_product_update_viewmodel_to_dto(viewmodel: ProductUpdateViewModel, db: AsyncSession) -> ProductUpdate:
    """Map ProductUpdateViewModel to ProductUpdate DTO using py-automapper"""
    mapper_logger.debug("Mapping product update viewmodel")
    update_data = {}

    if viewmodel.product_title is not None:
        update_data["name"] = viewmodel.product_title
    if viewmodel.product_description is not None:
        update_data["description"] = viewmodel.product_description
    if viewmodel.unit_price is not None:
        update_data["price"] = viewmodel.unit_price

    # Resolve category name to ID if provided
    if viewmodel.category_name:
        category = await get_category_by_name(db, viewmodel.category_name)
        if not category:
            mapper_logger.error(f"Category not found for product update: {viewmodel.category_name}")
            raise ValueError(f"Category '{viewmodel.category_name}' not found")
        update_data["category_id"] = category.id

    # Resolve supplier name to ID if provided
    if viewmodel.supplier_name:
        supplier = await get_supplier_by_name(db, viewmodel.supplier_name)
        if not supplier:
            mapper_logger.error(f"Supplier not found for product update: {viewmodel.supplier_name}")
            raise ValueError(f"Supplier '{viewmodel.supplier_name}' not found")
        update_data["supplier_id"] = supplier.id

    result = ProductUpdate(**update_data)
    mapper_logger.debug("Product update viewmodel mapped successfully")
    return result

def map_product_to_viewmodel(product: Product) -> ProductViewModel:
    """Map Product DTO to ProductViewModel using py-automapper"""
    mapper_logger.debug(f"Mapping product to viewmodel: {product.name}")
    # Get available stock from inventory relationship
    available_stock = 0
    if product.inventory:
        available_stock = product.inventory.quantity
    
    result = ProductViewModel(
        id=product.id,
        product_title=product.name or "Unknown Product",
        product_description=product.description,
        unit_price=product.price,
        category=map_category_to_viewmodel(product.category) if product.category else None,
        supplier=map_supplier_to_viewmodel(product.supplier) if product.supplier else None,
        available_stock=available_stock,
        created_at="N/A"  # Products don't have timestamps
    )
    mapper_logger.debug(f"Product mapped to viewmodel: {product.name} (stock: {available_stock})")
    return result