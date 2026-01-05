from fastapi import APIRouter, HTTPException, Depends, Query
from app.viewmodels.supplier import SupplierViewModel, SupplierCreateViewModel, SupplierUpdateViewModel
from app.services.supplier_service import SupplierService
from app.dependencies import get_supplier_service
from app.viewmodels.pagination import PaginatedResponse
import logging

router_logger = logging.getLogger("app.routers.suppliers")

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

@router.post("/", response_model=SupplierViewModel)
async def create_supplier(supplier: SupplierCreateViewModel, service: SupplierService = Depends(get_supplier_service)):
    router_logger.info(f"Creating supplier: {supplier.supplier_name}")
    try:
        result = await service.create_supplier(supplier)
        router_logger.info(f"Supplier created successfully: {result.id}")
        return result
    except Exception as e:
        router_logger.error(f"Failed to create supplier '{supplier.supplier_name}': {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{supplier_id}", response_model=SupplierViewModel)
async def read_supplier(supplier_id: int, service: SupplierService = Depends(get_supplier_service)):
    router_logger.info(f"Fetching supplier with ID: {supplier_id}")
    supplier = await service.get_supplier(supplier_id)
    if not supplier:
        router_logger.warning(f"Supplier not found: {supplier_id}")
        raise HTTPException(status_code=404, detail="Supplier not found")
    router_logger.info(f"Supplier retrieved: {supplier.supplier_name}")
    return supplier

@router.get("/", response_model=PaginatedResponse[SupplierViewModel])
async def read_suppliers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    search: str | None = Query(None, alias="q"),
    service: SupplierService = Depends(get_supplier_service)
):
    router_logger.info(f"Fetching suppliers with page={page}, page_size={page_size}, search={search}")
    skip = (page - 1) * page_size
    suppliers, total = await service.get_suppliers(skip, page_size, search)
    router_logger.info(f"Retrieved {len(suppliers)} suppliers out of total {total}")
    return PaginatedResponse(items=suppliers, total=total, page=page, page_size=page_size)

@router.put("/{supplier_id}", response_model=SupplierViewModel)
async def update_supplier(supplier_id: int, supplier: SupplierUpdateViewModel, service: SupplierService = Depends(get_supplier_service)):
    router_logger.info(f"Updating supplier {supplier_id}: {supplier.supplier_name if supplier.supplier_name else 'no name change'}")
    try:
        updated = await service.update_supplier(supplier_id, supplier)
        if not updated:
            router_logger.warning(f"Supplier not found for update: {supplier_id}")
            raise HTTPException(status_code=404, detail="Supplier not found")
        router_logger.info(f"Supplier updated successfully: {supplier_id}")
        return updated
    except Exception as e:
        router_logger.error(f"Failed to update supplier {supplier_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: int, service: SupplierService = Depends(get_supplier_service)):
    router_logger.info(f"Deleting supplier: {supplier_id}")
    deleted = await service.delete_supplier(supplier_id)
    if not deleted:
        router_logger.warning(f"Supplier not found for deletion: {supplier_id}")
        raise HTTPException(status_code=404, detail="Supplier not found")
    router_logger.info(f"Supplier deleted successfully: {supplier_id}")
    return {"message": "Supplier deleted"}