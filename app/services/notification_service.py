import asyncio
import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.viewmodels.notification import NotificationCreateViewModel, NotificationViewModel
from app.dbAccess import notification as notification_repo

service_logger = logging.getLogger("app.services.notification_service")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[asyncio.Queue] = []

    async def connect(self) -> asyncio.Queue:
        queue = asyncio.Queue()
        self.active_connections.append(queue)
        service_logger.debug(f"New SSE client connected. Total clients: {len(self.active_connections)}")
        return queue

    def disconnect(self, queue: asyncio.Queue):
        if queue in self.active_connections:
            self.active_connections.remove(queue)
            service_logger.debug(f"SSE client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for queue in self.active_connections:
            await queue.put(message)

# Global Manager Instance
manager = ConnectionManager()

class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_notifications(self, user_id: int | None):
        notifications = await notification_repo.get_notifications(self.db, user_id)
        return [NotificationViewModel.model_validate(n) for n in notifications]

    async def create_and_broadcast(self, notification: NotificationCreateViewModel):
        try:
            # 1. Save to DB
            saved = await notification_repo.create_notification(self.db, notification)
            
            # 2. Map to ViewModel
            vm = NotificationViewModel.model_validate(saved)
            
            # 3. Broadcast
            # Using model_dump_json to handle datetimes correctly
            payload = vm.model_dump_json()
            await manager.broadcast(f"data: {payload}\n\n")
            
            return vm
        except Exception as e:
            service_logger.error(f"Error creating notification: {e}")
            raise e

    async def mark_read(self, id: int):
        return await notification_repo.mark_as_read(self.db, id)
