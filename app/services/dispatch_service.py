from sqlalchemy.ext.asyncio import AsyncSession
from app.dbAccess import dispatch as dispatch_db
from app.mappers.dispatch_mapper import map_dispatch_order_to_viewmodel
from app.viewmodels.dispatch import (
    DispatchOrderViewModel,
    DispatchOrderCreateViewModel,
    DispatchOrderUpdateViewModel
)
from typing import List, Tuple
from datetime import datetime, timezone
from app.services.notification_service import NotificationService
from app.viewmodels.notification import NotificationCreateViewModel


class DispatchService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_dispatch_orders(
        self,
        skip: int = 0,
        limit: int = 10,
        search: str | None = None
    ) -> Tuple[List[DispatchOrderViewModel], int]:
        """Get paginated dispatch orders"""
        orders, total = await dispatch_db.get_dispatch_orders(self.db, skip, limit, search)
        return [map_dispatch_order_to_viewmodel(order) for order in orders], total
    
    async def get_dispatch_order(self, order_id: int) -> DispatchOrderViewModel | None:
        """Get dispatch order by ID"""
        order = await dispatch_db.get_dispatch_order_by_id(self.db, order_id)
        return map_dispatch_order_to_viewmodel(order) if order else None
    
    async def create_dispatch_order(
        self,
        data: DispatchOrderCreateViewModel
    ) -> DispatchOrderViewModel:
        """Create new dispatch order"""
        dispatch_date = data.dispatch_date or datetime.now(timezone.utc)
        
        items_data = [
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price
            }
            for item in data.items
        ]
        
        order = await dispatch_db.create_dispatch_order(
            self.db,
            dispatch_date,
            data.customer_name,
            data.payment_method,
            items_data,
            data.notes,
            data.tax_rate,
            data.status
        )
        
        # Notify
        try:
            notification_service = NotificationService(self.db)
            await notification_service.create_and_broadcast(NotificationCreateViewModel(
                type="info",
                title="New Dispatch Order",
                message=f"Dispatch order {order.dispatch_number} created for {order.customer_name}.",
                resource_type="dispatch",
                resource_id=int(order.id)
            ))
        except Exception:
            pass

        # Refresh order to handle expire_on_commit from notification service
        await self.db.refresh(order)
        return map_dispatch_order_to_viewmodel(order)
    
    async def update_dispatch_order(
        self,
        order_id: int,
        data: DispatchOrderUpdateViewModel
    ) -> DispatchOrderViewModel | None:
        """Update existing dispatch order"""
        items_data = None
        if data.items is not None:
            items_data = [
                {
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price
                }
                for item in data.items
            ]
        
        order = await dispatch_db.update_dispatch_order(
            self.db,
            order_id,
            data.dispatch_date,
            data.customer_name,
            data.status,
            data.payment_method,
            items_data,
            data.notes,
            data.tax_rate
        )
        
        if order and data.status == 'completed':
            try:
                notification_service = NotificationService(self.db)
                await notification_service.create_and_broadcast(NotificationCreateViewModel(
                    type="success",
                    title="Dispatch Completed",
                    message=f"Dispatch order {order.dispatch_number} has been completed.",
                    resource_type="dispatch",
                    resource_id=int(order.id)
                ))
            except Exception:
                pass
        
        # Refresh order to handle expire_on_commit from notification service
        if order: 
            await self.db.refresh(order)
            
        return map_dispatch_order_to_viewmodel(order) if order else None
    
    async def delete_dispatch_order(self, order_id: int) -> bool:
        """Delete dispatch order"""
        return await dispatch_db.delete_dispatch_order(self.db, order_id)
