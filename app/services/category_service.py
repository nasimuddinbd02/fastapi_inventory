from sqlalchemy.ext.asyncio import AsyncSession
from app.dbAccess.category import (
    create_category as crud_create_category,
    get_category,
    update_category as crud_update_category,
    delete_category as crud_delete_category,
    get_categories,
    get_category_by_name,
    count_categories
)
from app.viewmodels.category import CategoryCreateViewModel, CategoryUpdateViewModel, CategoryViewModel
from app.mappers.category_mapper import (
    map_category_create_viewmodel_to_dto, map_category_update_viewmodel_to_dto,
    map_category_to_viewmodel
)
import logging

service_logger = logging.getLogger("app.services.category")

class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        service_logger.debug("CategoryService initialized")

    async def create_category(self, category_viewmodel: CategoryCreateViewModel) -> CategoryViewModel:
        """Create category using ViewModel - business logic operates on ViewModel"""
        service_logger.info(f"Creating category: {category_viewmodel.category_name}")

        # Business logic: check if category name already exists
        existing_category = await get_category_by_name(self.db, category_viewmodel.category_name)
        if existing_category:
            service_logger.warning(f"Category name already exists: {category_viewmodel.category_name}")
            raise ValueError("Category name already exists")

        # Map ViewModel to DTO for database operations
        category_dto = map_category_create_viewmodel_to_dto(category_viewmodel)
        service_logger.debug(f"Mapped ViewModel to DTO: {category_dto.name}")

        # Create category in database
        db_category = await crud_create_category(self.db, category_dto)
        service_logger.info(f"Category created in database with ID: {db_category.id}")

        # Map back to ViewModel for response
        result = map_category_to_viewmodel(db_category)
        service_logger.debug(f"Mapped database result to ViewModel: {result.category_name}")
        return result

    async def get_category(self, category_id: int) -> CategoryViewModel:
        """Get category by ID"""
        service_logger.debug(f"Getting category by ID: {category_id}")
        category = await get_category(self.db, category_id)
        if not category:
            service_logger.debug(f"Category not found: {category_id}")
            return None
        result = map_category_to_viewmodel(category)
        service_logger.debug(f"Category retrieved: {result.category_name}")
        return result

    async def get_categories(self, skip: int = 0, limit: int = 100, search: str | None = None) -> tuple[list[CategoryViewModel], int]:
        """Get paginated list of categories"""
        service_logger.debug(f"Getting categories with skip={skip}, limit={limit}, search={search}")
        categories = await get_categories(self.db, skip, limit, search)
        total = await count_categories(self.db, search)
        result = [map_category_to_viewmodel(category) for category in categories]
        service_logger.debug(f"Retrieved {len(result)} categories out of total {total}")
        return result, total

    async def update_category(self, category_id: int, category_viewmodel: CategoryUpdateViewModel) -> CategoryViewModel:
        """Update category using ViewModel"""
        service_logger.info(f"Updating category {category_id}")

        # Business logic: check if updating to existing name
        if category_viewmodel.category_name:
            existing = await get_category_by_name(self.db, category_viewmodel.category_name)
            if existing and existing.id != category_id:
                service_logger.warning(f"Cannot update category {category_id} to existing name: {category_viewmodel.category_name}")
                raise ValueError("Category name already exists")

        # Map ViewModel to DTO
        category_dto = map_category_update_viewmodel_to_dto(category_viewmodel)
        service_logger.debug(f"Mapped update ViewModel to DTO")

        # Update in database
        updated_category = await crud_update_category(self.db, category_id, category_dto)
        if not updated_category:
            service_logger.warning(f"Category not found for update: {category_id}")
            return None

        result = map_category_to_viewmodel(updated_category)
        service_logger.info(f"Category updated successfully: {category_id}")
        return result

    async def delete_category(self, category_id: int) -> bool:
        """Delete category"""
        service_logger.info(f"Deleting category: {category_id}")
        result = await crud_delete_category(self.db, category_id) is not None
        if result:
            service_logger.info(f"Category deleted successfully: {category_id}")
        else:
            service_logger.warning(f"Category not found for deletion: {category_id}")
        return result