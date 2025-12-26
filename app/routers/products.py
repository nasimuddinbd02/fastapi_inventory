from fastapi import APIRouter, HTTPException, Depends
from app.viewmodels.product import ProductViewModel, ProductCreateViewModel, ProductUpdateViewModel
from app.services.product_service import ProductService
from app.dependencies import get_product_service
import logging

router_logger = logging.getLogger("app.routers.products")

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=ProductViewModel)
async def create_product(product: ProductCreateViewModel, service: ProductService = Depends(get_product_service)):
    router_logger.info(f"Creating product: {product.product_title}")
    try:
        result = await service.create_product(product)
        router_logger.info(f"Product created successfully: {result.id}")
        return result
    except Exception as e:
        router_logger.error(f"Failed to create product '{product.product_title}': {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{product_id}", response_model=ProductViewModel)
async def read_product(product_id: int, service: ProductService = Depends(get_product_service)):
    router_logger.info(f"Fetching product with ID: {product_id}")
    product = await service.get_product(product_id)
    if not product:
        router_logger.warning(f"Product not found: {product_id}")
        raise HTTPException(status_code=404, detail="Product not found")
    router_logger.info(f"Product retrieved: {product.product_title}")
    return product

@router.get("/", response_model=list[ProductViewModel])
async def read_products(skip: int = 0, limit: int = 100, service: ProductService = Depends(get_product_service)):
    router_logger.info(f"Fetching products with skip={skip}, limit={limit}")
    products = await service.get_products(skip, limit)
    router_logger.info(f"Retrieved {len(products)} products")
    return products

@router.put("/{product_id}", response_model=ProductViewModel)
async def update_product(product_id: int, product: ProductUpdateViewModel, service: ProductService = Depends(get_product_service)):
    router_logger.info(f"Updating product {product_id}: {product.product_title if product.product_title else 'no title change'}")
    try:
        updated = await service.update_product(product_id, product)
        if not updated:
            router_logger.warning(f"Product not found for update: {product_id}")
            raise HTTPException(status_code=404, detail="Product not found")
        router_logger.info(f"Product updated successfully: {product_id}")
        return updated
    except Exception as e:
        router_logger.error(f"Failed to update product {product_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{product_id}")
async def delete_product(product_id: int, service: ProductService = Depends(get_product_service)):
    router_logger.info(f"Deleting product: {product_id}")
    deleted = await service.delete_product(product_id)
    if not deleted:
        router_logger.warning(f"Product not found for deletion: {product_id}")
        raise HTTPException(status_code=404, detail="Product not found")
    router_logger.info(f"Product deleted successfully: {product_id}")
    return {"message": "Product deleted"}