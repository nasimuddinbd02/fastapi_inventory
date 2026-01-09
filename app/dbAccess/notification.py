from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.models.notification import Notification
from app.viewmodels.notification import NotificationCreateViewModel
import logging

db_logger = logging.getLogger("app.dbAccess.notification")

async def get_notifications(db: AsyncSession, user_id: int | None = None, limit: int = 50):
    query = select(Notification).order_by(desc(Notification.created_at)).limit(limit)
    
    if user_id is not None:
        # Get system-wide (null) or user specific
        query = query.where((Notification.user_id == user_id) | (Notification.user_id == None))
    
    result = await db.execute(query)
    return result.scalars().all()

async def create_notification(db: AsyncSession, notification: NotificationCreateViewModel):
    db_notification = Notification(**notification.model_dump())
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification

async def mark_as_read(db: AsyncSession, notification_id: int):
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notification = result.scalars().first()
    if notification:
        notification.is_read = True
        await db.commit()
        await db.refresh(notification)
    return notification

async def mark_all_as_read(db: AsyncSession, user_id: int):
    # This is slightly complex because of system notifications (null user_id).
    # Ideally we'd have a UserNotification status table, but for MVP we might validly
    # assume that if a user clicks "Mark all read", they mean THEIR view.
    # However, since system notifications are shared, marking them read would mark for everyone.
    # For now, let's only mark user-specific notifications or implement a constraint.
    # MVP: Only mark user_id owned notifications.
    notifications = await get_notifications(db, user_id, 100)
    for n in notifications:
        if n.user_id == user_id or n.user_id is None: # Be careful with system ones
             # For MVP, let's just mark them read in the object. 
             # If multiple users see the same 'system' notification, one reading it marks it for all?
             # Yes, that's the limitation of this simple model.
             # Better: Only mark if user_id matches.
             if n.user_id == user_id:
                 n.is_read = True
    
    await db.commit()
