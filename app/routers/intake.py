from fastapi import APIRouter, HTTPException, Depends, Query
from app.viewmodels.intake import (
    IntakeOrderViewModel,
    IntakeOrderCreateViewModel,
    IntakeOrderUpdateViewModel
)
from app.viewmodels.pagination import PaginatedResponse
from app.services.intake_service import IntakeService
from app.dependencies import get_intake_service

router = APIRouter(prefix="/intake", tags=["intake"])


@router.get("/", response_model=PaginatedResponse[IntakeOrderViewModel])
async def get_intake_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    search: str | None = Query(None, alias="q"),
    service: IntakeService = Depends(get_intake_service)
):
    """Get paginated list of intake orders"""
    skip = (page - 1) * page_size
    orders, total = await service.get_intake_orders(skip, page_size, search)
    return PaginatedResponse(items=orders, total=total, page=page, page_size=page_size)


@router.get("/{order_id}", response_model=IntakeOrderViewModel)
async def get_intake_order(
    order_id: int,
    service: IntakeService = Depends(get_intake_service)
):
    """Get intake order by ID"""
    order = await service.get_intake_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Intake order not found")
    return order


@router.post("/", response_model=IntakeOrderViewModel)
async def create_intake_order(
    data: IntakeOrderCreateViewModel,
    service: IntakeService = Depends(get_intake_service)
):
    """Create new intake order"""
    try:
        return await service.create_intake_order(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{order_id}", response_model=IntakeOrderViewModel)
async def update_intake_order(
    order_id: int,
    data: IntakeOrderUpdateViewModel,
    service: IntakeService = Depends(get_intake_service)
):
    """Update existing intake order"""
    try:
        order = await service.update_intake_order(order_id, data)
        if not order:
            raise HTTPException(status_code=404, detail="Intake order not found")
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{order_id}")
async def delete_intake_order(
    order_id: int,
    service: IntakeService = Depends(get_intake_service)
):
    """Delete intake order"""
    try:
        deleted = await service.delete_intake_order(order_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Intake order not found")
        return {"message": "Intake order deleted"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
