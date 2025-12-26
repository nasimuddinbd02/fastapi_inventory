from fastapi import APIRouter, HTTPException, Depends
from app.viewmodels.user import UserCreateViewModel, UserUpdateViewModel, UserViewModel, UserLoginViewModel
from app.services.user_service import UserService
from app.dependencies import get_user_service

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserViewModel)
async def create_user(user: UserCreateViewModel, service: UserService = Depends(get_user_service)):
    try:
        return await service.create_user(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}", response_model=UserViewModel)
async def read_user(user_id: int, service: UserService = Depends(get_user_service)):
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=list[UserViewModel])
async def read_users(skip: int = 0, limit: int = 100, service: UserService = Depends(get_user_service)):
    return await service.get_users(skip, limit)

@router.put("/{user_id}", response_model=UserViewModel)
async def update_user(user_id: int, user: UserUpdateViewModel, service: UserService = Depends(get_user_service)):
    try:
        updated = await service.update_user(user_id, user)
        if not updated:
            raise HTTPException(status_code=404, detail="User not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{user_id}")
async def delete_user(user_id: int, service: UserService = Depends(get_user_service)):
    deleted = await service.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

@router.post("/login", response_model=UserViewModel)
async def login_user(login_data: UserLoginViewModel, service: UserService = Depends(get_user_service)):
    user = await service.authenticate_user(login_data)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user