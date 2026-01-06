from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from app.database import engine, Base, SessionLocal
from app.routers import categories, suppliers, products, inventory, users, agents, intake, dispatch, settings
from app.logging_config import setup_logging
from app.dbAccess.settings import initialize_default_settings
from app.exceptions import AppException
from app.error_responses import ErrorResponse
import logging
import uuid

# Setup logging
setup_logging()
logger = logging.getLogger("app")

@asynccontextmanager
async def app_lifespan(app: FastAPI):
    logger.info("Starting Cosmetics Inventory API")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified successfully")
    
    # Initialize default settings
    async with SessionLocal() as db:
        await initialize_default_settings(db)
    logger.info("Default application settings initialized")
    
    try:
        yield
    finally:
        logger.info("Shutting down Cosmetics Inventory API")

app = FastAPI(title="Cosmetics Inventory API", description="API for managing cosmetics inventory", version="1.0.0", lifespan=app_lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        ).model_dump()
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
        ).model_dump()
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
        ).model_dump()
    )



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
app.include_router(intake.router)
app.include_router(dispatch.router)
app.include_router(settings.router)

# API Versioning - v1 endpoints using APIRouter
v1_router = APIRouter(prefix="/v1")

@v1_router.get("/")
async def read_root_v1():
    logger.info("V1 Root endpoint accessed")
    return {"message": "Welcome to the Cosmetics Inventory API v1", "version": "1.0.0"}

# Include routers in v1 with versioned prefixes and tags
v1_router.include_router(categories.router, tags=["v1/categories"])
v1_router.include_router(suppliers.router, tags=["v1/suppliers"])
v1_router.include_router(products.router, tags=["v1/products"])
v1_router.include_router(inventory.router, tags=["v1/inventory"])
v1_router.include_router(users.router, tags=["v1/users"])
v1_router.include_router(agents.router, tags=["v1/agents"])
v1_router.include_router(intake.router, tags=["v1/intake"])
v1_router.include_router(dispatch.router, tags=["v1/dispatch"])
v1_router.include_router(settings.router, tags=["v1/settings"])

# Attach v1 router to main app
app.include_router(v1_router)