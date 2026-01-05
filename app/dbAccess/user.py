from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, func, or_
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

def _user_search_filter(search: str | None):
    if not search:
        return None
    pattern = f"%{search.lower()}%"
    return or_(
        func.lower(User.username).like(pattern),
        func.lower(User.email).like(pattern),
        func.lower(User.full_name).like(pattern)
    )


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100, search: str | None = None):
    query = select(User)
    search_filter = _user_search_filter(search.strip().lower() if search else None)
    if search_filter is not None:
        query = query.where(search_filter)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


async def count_users(db: AsyncSession, search: str | None = None) -> int:
    query = select(func.count(User.id))
    search_filter = _user_search_filter(search.strip().lower() if search else None)
    if search_filter is not None:
        query = query.where(search_filter)
    result = await db.execute(query)
    return result.scalar_one()

async def create_user(db: AsyncSession, user: UserCreate):
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=user.password,
        is_active=user.is_active
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, user_id: int, user: UserUpdate):
    update_data = user.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = update_data.pop("password")
    if update_data:
        await db.execute(
            update(User).where(User.id == user_id).values(**update_data)
        )
        await db.commit()
    return await get_user(db, user_id)

async def delete_user(db: AsyncSession, user_id: int):
    db_user = await get_user(db, user_id)
    if db_user:
        await db.delete(db_user)
        await db.commit()
    return db_user

async def authenticate_user(db: AsyncSession, username: str):
    return await get_user_by_username(db, username)