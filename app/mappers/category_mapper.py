from automapper import Mapper
from app.viewmodels.category import (
    CategoryCreateViewModel, CategoryUpdateViewModel, CategoryViewModel
)
from app.schemas.category import CategoryCreate, CategoryUpdate, Category
import logging

mapper_logger = logging.getLogger("app.mappers.category")

# Create mapper instance
mapper = Mapper()

def map_category_create_viewmodel_to_dto(viewmodel: CategoryCreateViewModel) -> CategoryCreate:
    """Map CategoryCreateViewModel to CategoryCreate DTO using py-automapper"""
    mapper_logger.debug(f"Mapping CategoryCreateViewModel to DTO: {viewmodel.category_name}")
    result = CategoryCreate(
        name=viewmodel.category_name,
        description=viewmodel.category_description
    )
    mapper_logger.debug(f"Mapping result: name={result.name}")
    return result

def map_category_update_viewmodel_to_dto(viewmodel: CategoryUpdateViewModel) -> CategoryUpdate:
    """Map CategoryUpdateViewModel to CategoryUpdate DTO using py-automapper"""
    mapper_logger.debug(f"Mapping CategoryUpdateViewModel to DTO: {viewmodel.category_name}")
    result = CategoryUpdate(
        name=viewmodel.category_name,
        description=viewmodel.category_description
    )
    mapper_logger.debug(f"Mapping result: name={result.name}")
    return result

def map_category_to_viewmodel(category: Category) -> CategoryViewModel:
    """Map Category DTO to CategoryViewModel using py-automapper"""
    mapper_logger.debug(f"Mapping Category DTO to ViewModel: {category.name}")
    result = CategoryViewModel(
        id=category.id,
        category_name=category.name,
        category_description=category.description,
        created_at="N/A"  # Categories don't have timestamps in current model
    )
    mapper_logger.debug(f"Mapping result: category_name={result.category_name}")
    return result