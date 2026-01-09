from sqlalchemy.ext.asyncio import AsyncSession
from app.dbAccess import intake as intake_db
from app.mappers.intake_mapper import map_intake_order_to_viewmodel
from app.viewmodels.intake import (
    IntakeOrderViewModel,
    IntakeOrderCreateViewModel,
    IntakeOrderUpdateViewModel
)
from typing import List, Tuple
from datetime import datetime, timezone
from app.services.notification_service import NotificationService
from app.viewmodels.notification import NotificationCreateViewModel


class IntakeService:
    def __init__(self, db: AsyncSession):
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
        
        # Notify
        try:
            notification_service = NotificationService(self.db)
            await notification_service.create_and_broadcast(NotificationCreateViewModel(
                type="info",
                title="New Intake Order",
                message=f"Intake order {order.intake_number} created.",
                resource_type="intake",
                resource_id=int(order.id)
            ))
        except Exception:
            pass # Don't fail the request if notification fails

        except Exception:
            pass # Don't fail the request if notification fails

        # Refresh to handle expire caused by notification service commit
        await self.db.refresh(order)
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
        
        if order and data.status == 'confirmed':
             try:
                notification_service = NotificationService(self.db)
                await notification_service.create_and_broadcast(NotificationCreateViewModel(
                    type="success",
                    title="Intake Confirmed",
                    message=f"Intake order {order.intake_number} has been confirmed.",
                    resource_type="intake",
                    resource_id=int(order.id)
                ))
             except Exception:
                pass

             except Exception:
                pass

        if order:
            await self.db.refresh(order)

        return map_intake_order_to_viewmodel(order) if order else None
    
    async def delete_intake_order(self, order_id: int) -> bool:
        """Delete intake order"""
        return await intake_db.delete_intake_order(self.db, order_id)
