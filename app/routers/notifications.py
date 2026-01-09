from fastapi import APIRouter, Depends, Query, Request, status, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from jwt import PyJWTError, decode
from typing import List

from app.database import get_db
from app.auth import get_current_user, SECRET_KEY, ALGORITHM
from app.services.notification_service import NotificationService, manager
from app.viewmodels.notification import NotificationViewModel
from app.dbAccess.user import get_user_by_username
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])

async def get_user_from_token(token: str, db: AsyncSession):
    try:
        payload = decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
    except PyJWTError:
        return None
    
    user = await get_user_by_username(db, username)
    return user

@router.get("/stream")
async def stream_notifications(
    token: str = Query(..., description="Project-specific Bearer token"),
    db: AsyncSession = Depends(get_db)
):
    """
    SSE Endpoint for real-time notifications.
    Requires token as query parameter because EventSource doesn't support headers.
    """
    user = await get_user_from_token(token, db)
    if not user:
         # SSE requires a 200 stream, but we can't auth. 
         # In browsers, a 401 on EventSource is handled as error.
         raise HTTPException(status_code=401, detail="Invalid token")

    async def event_generator():
        # Connect to manager
        queue = await manager.connect()
        try:
            while True:
                # Wait for data
                # Ideally we check if the message is for THIS user, but for now it's broadcast
                # In a real app we'd filter inside broadcast or here.
                data = await queue.get()
                yield data
        except Exception:
            pass
        finally:
            manager.disconnect(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/", response_model=List[NotificationViewModel])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationService(db)
    return await service.get_notifications(current_user.id)

@router.put("/{id}/read")
async def mark_read(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationService(db)
    # Ideally verify ownership
    await service.mark_read(id)
    return {"status": "success"}
