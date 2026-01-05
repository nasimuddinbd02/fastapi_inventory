from sqlalchemy.orm import Session
from app.dbAccess import intake as intake_db
from app.mappers.intake_mapper import map_intake_order_to_viewmodel
from app.viewmodels.intake import (
    IntakeOrderViewModel,
    IntakeOrderCreateViewModel,
    IntakeOrderUpdateViewModel
)
from typing import List, Tuple
from datetime import datetime, timezone


class IntakeService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_intake_orders(
        self,
        skip: int = 0,
        limit: int = 10,
        search: str | None = None
    ) -> Tuple[List[IntakeOrderViewModel], int]:
        """Get paginated intake orders"""
        orders, total = await intake_db.get_intake_orders(self.db, skip, limit, search)
        return [map_intake_order_to_viewmodel(order) for order in orders], total
    
    async def get_intake_order(self, order_id: int) -> IntakeOrderViewModel | None:
        """Get intake order by ID"""
        order = await intake_db.get_intake_order_by_id(self.db, order_id)
        return map_intake_order_to_viewmodel(order) if order else None
    
    async def create_intake_order(
        self,
        data: IntakeOrderCreateViewModel
    ) -> IntakeOrderViewModel:
        """Create new intake order"""
        intake_date = data.intake_date or datetime.now(timezone.utc)
        
        items_data = [
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_cost": item.unit_cost
            }
            for item in data.items
        ]
        
        order = await intake_db.create_intake_order(
            self.db,
            intake_date,
            data.supplier_id,
            items_data,
            data.notes,
            data.status
        )
        
        return map_intake_order_to_viewmodel(order)
    
    async def update_intake_order(
        self,
        order_id: int,
        data: IntakeOrderUpdateViewModel
    ) -> IntakeOrderViewModel | None:
        """Update existing intake order"""
        items_data = None
        if data.items is not None:
            items_data = [
                {
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "unit_cost": item.unit_cost
                }
                for item in data.items
            ]
        
        order = await intake_db.update_intake_order(
            self.db,
            order_id,
            data.intake_date,
            data.supplier_id,
            data.status,
            items_data,
            data.notes
        )
        
        return map_intake_order_to_viewmodel(order) if order else None
    
    async def delete_intake_order(self, order_id: int) -> bool:
        """Delete intake order"""
        return await intake_db.delete_intake_order(self.db, order_id)
