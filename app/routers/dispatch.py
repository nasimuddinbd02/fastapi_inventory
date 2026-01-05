from fastapi import APIRouter, HTTPException, Depends, Query
from app.viewmodels.dispatch import (
    DispatchOrderViewModel,
    DispatchOrderCreateViewModel,
    DispatchOrderUpdateViewModel
)
from app.viewmodels.pagination import PaginatedResponse
from app.services.dispatch_service import DispatchService
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/dispatch", tags=["dispatch"])


def get_dispatch_service(db: Session = Depends(get_db)) -> DispatchService:
    return DispatchService(db)


@router.get("/", response_model=PaginatedResponse[DispatchOrderViewModel])
async def get_dispatch_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    search: str | None = Query(None, alias="q"),
    service: DispatchService = Depends(get_dispatch_service)
):
    """Get paginated list of dispatch orders"""
    skip = (page - 1) * page_size
    orders, total = await service.get_dispatch_orders(skip, page_size, search)
    return PaginatedResponse(items=orders, total=total, page=page, page_size=page_size)


@router.get("/{order_id}", response_model=DispatchOrderViewModel)
async def get_dispatch_order(
    order_id: int,
    service: DispatchService = Depends(get_dispatch_service)
):
    """Get dispatch order by ID"""
    order = await service.get_dispatch_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Dispatch order not found")
    return order


@router.post("/", response_model=DispatchOrderViewModel)
async def create_dispatch_order(
    data: DispatchOrderCreateViewModel,
    service: DispatchService = Depends(get_dispatch_service)
):
    """Create new dispatch order"""
    try:
        return await service.create_dispatch_order(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{order_id}", response_model=DispatchOrderViewModel)
async def update_dispatch_order(
    order_id: int,
    data: DispatchOrderUpdateViewModel,
    service: DispatchService = Depends(get_dispatch_service)
):
    """Update existing dispatch order"""
    try:
        order = await service.update_dispatch_order(order_id, data)
        if not order:
            raise HTTPException(status_code=404, detail="Dispatch order not found")
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{order_id}")
async def delete_dispatch_order(
    order_id: int,
    service: DispatchService = Depends(get_dispatch_service)
):
    """Delete dispatch order"""
    try:
        deleted = await service.delete_dispatch_order(order_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Dispatch order not found")
        return {"message": "Dispatch order deleted"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
