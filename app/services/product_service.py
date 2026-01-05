from sqlalchemy.ext.asyncio import AsyncSession
from app.dbAccess.product import (
    create_product as crud_create_product,
    get_product,
    update_product as crud_update_product,
    delete_product as crud_delete_product,
    get_products,
    count_products
)
from app.viewmodels.product import ProductCreateViewModel, ProductUpdateViewModel, ProductViewModel
from app.mappers.product_mapper import (
    map_product_create_viewmodel_to_dto, map_product_update_viewmodel_to_dto,
    map_product_to_viewmodel
)
import logging

service_logger = logging.getLogger("app.services.product_service")

class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
        service_logger.debug("ProductService initialized")

    async def create_product(self, product_viewmodel: ProductCreateViewModel) -> ProductViewModel:
        """Create product using ViewModel - business logic operates on ViewModel"""
        service_logger.info(f"Creating product: {product_viewmodel.product_title}")
        
        # Business logic: validate price
        if product_viewmodel.unit_price <= 0:
            service_logger.warning(f"Invalid unit price for product '{product_viewmodel.product_title}': {product_viewmodel.unit_price}")
            raise ValueError("Unit price must be positive")

        service_logger.debug(f"Mapping product '{product_viewmodel.product_title}' to DTO")
        # Map ViewModel to DTO (this also validates category/supplier existence)
        product_dto = await map_product_create_viewmodel_to_dto(product_viewmodel, self.db)

        service_logger.debug(f"Creating product '{product_viewmodel.product_title}' in database")
        # Create product in database
        db_product = await crud_create_product(self.db, product_dto)

        # Ensure relationships are loaded
        await self.db.refresh(db_product, ['category', 'supplier'])

        # Map back to ViewModel for response
        result = map_product_to_viewmodel(db_product)
        service_logger.info(f"Product created successfully: {result.product_title} (ID: {result.id})")
        return result

    async def get_product(self, product_id: int) -> ProductViewModel:
        """Get product by ID"""
        service_logger.info(f"Retrieving product with ID: {product_id}")
        product = await get_product(self.db, product_id)
        if not product:
            service_logger.warning(f"Product not found: {product_id}")
            return None
        result = map_product_to_viewmodel(product)
        service_logger.info(f"Product retrieved: {result.product_title}")
        return result

    async def get_products(self, skip: int = 0, limit: int = 100, search: str | None = None) -> tuple[list[ProductViewModel], int]:
        """Get paginated list of products"""
        service_logger.info(f"Retrieving products with skip={skip}, limit={limit}, search={search}")
        products = await get_products(self.db, skip, limit, search)
        total = await count_products(self.db, search)
        results = [map_product_to_viewmodel(product) for product in products]
        service_logger.info(f"Retrieved {len(results)} products out of total {total}")
        return results, total

    async def update_product(self, product_id: int, product_viewmodel: ProductUpdateViewModel) -> ProductViewModel:
        """Update product using ViewModel"""
        service_logger.info(f"Updating product {product_id}")
        
        # Business logic: validate price if provided
        if product_viewmodel.unit_price is not None and product_viewmodel.unit_price <= 0:
            service_logger.warning(f"Invalid unit price for product update {product_id}: {product_viewmodel.unit_price}")
            raise ValueError("Unit price must be positive")

        service_logger.debug(f"Mapping product update {product_id} to DTO")
        # Map ViewModel to DTO (validates category/supplier if names provided)
        product_dto = await map_product_update_viewmodel_to_dto(product_viewmodel, self.db)

        service_logger.debug(f"Updating product {product_id} in database")
        # Update in database
        updated_product = await crud_update_product(self.db, product_id, product_dto)
        if not updated_product:
            service_logger.warning(f"Product not found for update: {product_id}")
            return None

        result = map_product_to_viewmodel(updated_product)
        service_logger.info(f"Product updated successfully: {result.product_title} (ID: {product_id})")
        return result

    async def delete_product(self, product_id: int) -> bool:
        """Delete product"""
        service_logger.info(f"Deleting product: {product_id}")
        deleted = await crud_delete_product(self.db, product_id)
        if deleted:
            service_logger.info(f"Product deleted successfully: {product_id}")
        else:
            service_logger.warning(f"Product not found for deletion: {product_id}")
        return deleted is not None