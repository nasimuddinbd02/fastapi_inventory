from fastapi import APIRouter, HTTPException, Depends, Query
from app.viewmodels.category import CategoryViewModel, CategoryCreateViewModel, CategoryUpdateViewModel
from app.services.category_service import CategoryService
from app.dependencies import get_category_service
from app.viewmodels.pagination import PaginatedResponse
import logging

router_logger = logging.getLogger("app.routers.categories")

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=CategoryViewModel)
async def create_category(category: CategoryCreateViewModel, service: CategoryService = Depends(get_category_service)):
    router_logger.info(f"Creating category: {category.category_name}")
    try:
        result = await service.create_category(category)
        router_logger.info(f"Category created successfully: {result.id}")
        return result
    except Exception as e:
        router_logger.error(f"Failed to create category '{category.category_name}': {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{category_id}", response_model=CategoryViewModel)
async def read_category(category_id: int, service: CategoryService = Depends(get_category_service)):
    router_logger.info(f"Fetching category with ID: {category_id}")
    category = await service.get_category(category_id)
    if not category:
        router_logger.warning(f"Category not found: {category_id}")
        raise HTTPException(status_code=404, detail="Category not found")
    router_logger.info(f"Category retrieved: {category.category_name}")
    return category

@router.get("/", response_model=PaginatedResponse[CategoryViewModel])
async def read_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    search: str | None = Query(None, alias="q"),
    service: CategoryService = Depends(get_category_service)
):
    router_logger.info(f"Fetching categories with page={page}, page_size={page_size}, search={search}")
    skip = (page - 1) * page_size
    categories, total = await service.get_categories(skip, page_size, search)
    router_logger.info(f"Retrieved {len(categories)} categories out of total {total}")
    return PaginatedResponse(items=categories, total=total, page=page, page_size=page_size)

@router.put("/{category_id}", response_model=CategoryViewModel)
async def update_category(category_id: int, category: CategoryUpdateViewModel, service: CategoryService = Depends(get_category_service)):
    router_logger.info(f"Updating category {category_id}: {category.category_name if category.category_name else 'no name change'}")
    try:
        updated = await service.update_category(category_id, category)
        if not updated:
            router_logger.warning(f"Category not found for update: {category_id}")
            raise HTTPException(status_code=404, detail="Category not found")
        router_logger.info(f"Category updated successfully: {category_id}")
        return updated
    except Exception as e:
        router_logger.error(f"Failed to update category {category_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{category_id}")
async def delete_category(category_id: int, service: CategoryService = Depends(get_category_service)):
    router_logger.info(f"Deleting category: {category_id}")
    deleted = await service.delete_category(category_id)
    if not deleted:
        router_logger.warning(f"Category not found for deletion: {category_id}")
        raise HTTPException(status_code=404, detail="Category not found")
    router_logger.info(f"Category deleted successfully: {category_id}")
    return {"message": "Category deleted"}