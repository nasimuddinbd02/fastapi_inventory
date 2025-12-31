from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from app.database import engine, Base
from app.routers import categories, suppliers, products, inventory, users, agents
from app.logging_config import setup_logging
from app.exceptions import (
    AppException, ValidationError, NotFoundError, ConflictError,
    AuthenticationError, AuthorizationError, BusinessLogicError,
    DatabaseError, ExternalServiceError
)
from app.error_responses import ErrorResponse
import logging
import uuid

# Setup logging
setup_logging()
logger = logging.getLogger("app")

app = FastAPI(title="Cosmetics Inventory API", description="API for managing cosmetics inventory", version="1.0.0")

# Global Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle custom application exceptions"""
    request_id = str(uuid.uuid4())
    logger.error(f"AppException - Request ID: {request_id}, Path: {request.url.path}, Error: {exc.message}", exc_info=True)

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse.create(
            message=exc.message,
            error_code=exc.error_code,
            status_code=exc.status_code,
            details=exc.details,
            request_id=request_id,
            path=str(request.url.path)
        ).dict()
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle FastAPI HTTP exceptions"""
    request_id = str(uuid.uuid4())
    logger.error(f"HTTPException - Request ID: {request_id}, Path: {request.url.path}, Status: {exc.status_code}, Detail: {exc.detail}")

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse.create(
            message=exc.detail,
            error_code=f"HTTP_{exc.status_code}",
            status_code=exc.status_code,
            details={},
            request_id=request_id,
            path=str(request.url.path)
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    request_id = str(uuid.uuid4())
    logger.error(f"Unexpected Exception - Request ID: {request_id}, Path: {request.url.path}, Error: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content=ErrorResponse.create(
            message="An unexpected error occurred",
            error_code="INTERNAL_SERVER_ERROR",
            status_code=500,
            details={"original_error": str(exc)} if logger.level <= logging.DEBUG else {},
            request_id=request_id,
            path=str(request.url.path)
        ).dict()
    )

@app.on_event("startup")
async def startup():
    logger.info("Starting Cosmetics Inventory API")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified successfully")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down Cosmetics Inventory API")

@app.get("/")
async def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the Cosmetics Inventory API"}

# Include routers for backward compatibility (unversioned)
app.include_router(categories.router)
app.include_router(suppliers.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(users.router)
app.include_router(agents.router)

# API Versioning - v1 endpoints
v1 = FastAPI(title="Cosmetics Inventory API v1", description="Version 1 of the Cosmetics Inventory API", version="1.0.0")

# Global Exception Handlers for v1
@v1.exception_handler(AppException)
async def v1_app_exception_handler(request: Request, exc: AppException):
    """Handle custom application exceptions for v1"""
    request_id = str(uuid.uuid4())
    logger.error(f"V1 AppException - Request ID: {request_id}, Path: {request.url.path}, Error: {exc.message}", exc_info=True)

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse.create(
            message=exc.message,
            error_code=exc.error_code,
            status_code=exc.status_code,
            details=exc.details,
            request_id=request_id,
            path=str(request.url.path)
        ).dict()
    )

@v1.exception_handler(HTTPException)
async def v1_http_exception_handler(request: Request, exc: HTTPException):
    """Handle FastAPI HTTP exceptions for v1"""
    request_id = str(uuid.uuid4())
    logger.error(f"V1 HTTPException - Request ID: {request_id}, Path: {request.url.path}, Status: {exc.status_code}, Detail: {exc.detail}")

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse.create(
            message=exc.detail,
            error_code=f"HTTP_{exc.status_code}",
            status_code=exc.status_code,
            details={},
            request_id=request_id,
            path=str(request.url.path)
        ).dict()
    )

@v1.exception_handler(Exception)
async def v1_general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions for v1"""
    request_id = str(uuid.uuid4())
    logger.error(f"V1 Unexpected Exception - Request ID: {request_id}, Path: {request.url.path}, Error: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content=ErrorResponse.create(
            message="An unexpected error occurred",
            error_code="INTERNAL_SERVER_ERROR",
            status_code=500,
            details={"original_error": str(exc)} if logger.level <= logging.DEBUG else {},
            request_id=request_id,
            path=str(request.url.path)
        ).dict()
    )

@v1.get("/")
async def read_root_v1():
    logger.info("V1 Root endpoint accessed")
    return {"message": "Welcome to the Cosmetics Inventory API v1", "version": "1.0.0"}

# Include routers in v1 with versioned tags
v1.include_router(categories.router, tags=["v1/categories"])
v1.include_router(suppliers.router, tags=["v1/suppliers"])
v1.include_router(products.router, tags=["v1/products"])
v1.include_router(inventory.router, tags=["v1/inventory"])
v1.include_router(users.router, tags=["v1/users"])
v1.include_router(agents.router, tags=["v1/agents"])

# Mount v1 API
# app.mount("/v1", v1)