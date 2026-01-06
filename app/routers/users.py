from fastapi import APIRouter, HTTPException, Depends, Response, Query
from app.viewmodels.user import UserCreateViewModel, UserUpdateViewModel, UserViewModel, UserLoginViewModel
from app.services.user_service import UserService, Token, RefreshTokenRequest
from app.dependencies import get_user_service
from app.auth import get_current_active_user
from app.models.user import User
from app.viewmodels.pagination import PaginatedResponse

router = APIRouter(prefix="/users", tags=["users"])

async def _create_user(user: UserCreateViewModel, service: UserService):
    try:
        return await service.create_user(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/", response_model=UserViewModel)
async def create_user(user: UserCreateViewModel, service: UserService = Depends(get_user_service)):
    return await _create_user(user, service)


@router.post("", response_model=UserViewModel, include_in_schema=False)
async def create_user_no_slash(user: UserCreateViewModel, service: UserService = Depends(get_user_service)):
    return await _create_user(user, service)


@router.options("", include_in_schema=False)
async def options_users_no_slash() -> Response:
    return Response(status_code=204)


@router.options("/", include_in_schema=False)
async def options_users_slash() -> Response:
    return Response(status_code=204)

@router.post("/login", response_model=Token)
async def login_user(login_data: UserLoginViewModel, service: UserService = Depends(get_user_service)):
    try:
        token = await service.authenticate_user(login_data)
        if not token:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return token
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest, service: UserService = Depends(get_user_service)):
    """Refresh access token using refresh token"""
    token = await service.refresh_access_token(request.refresh_token)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    return token


@router.get("/me", response_model=UserViewModel)
async def read_current_user(current_user: User = Depends(get_current_active_user)):
    """Get current authenticated user information"""
    from app.mappers.user_mapper import map_user_to_viewmodel
    return map_user_to_viewmodel(current_user)


@router.put("/me", response_model=UserViewModel)
async def update_current_user(
    user: UserUpdateViewModel,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(get_current_active_user)
):
    """Update current authenticated user's profile"""
    try:
        updated = await service.update_user(current_user.id, user)
        if not updated:
            raise HTTPException(status_code=404, detail="User not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}", response_model=UserViewModel)
async def read_user(user_id: int, service: UserService = Depends(get_user_service)):
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=PaginatedResponse[UserViewModel])
async def read_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    search: str | None = Query(None, alias="q"),
    service: UserService = Depends(get_user_service)
):
    skip = (page - 1) * page_size
    users, total = await service.get_users(skip, page_size, search)
    return PaginatedResponse(items=users, total=total, page=page, page_size=page_size)


@router.get("", response_model=PaginatedResponse[UserViewModel], include_in_schema=False)
async def read_users_no_slash(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None, alias="q"),
    service: UserService = Depends(get_user_service)
):
    skip = (page - 1) * page_size
    users, total = await service.get_users(skip, page_size, search)
    return PaginatedResponse(items=users, total=total, page=page, page_size=page_size)


@router.put("/{user_id}", response_model=UserViewModel)
async def update_user(user_id: int, user: UserUpdateViewModel, service: UserService = Depends(get_user_service), current_user: User = Depends(get_current_active_user)):
    try:
        updated = await service.update_user(user_id, user)
        if not updated:
            raise HTTPException(status_code=404, detail="User not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}")
async def delete_user(user_id: int, service: UserService = Depends(get_user_service), current_user: User = Depends(get_current_active_user)):
    deleted = await service.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}