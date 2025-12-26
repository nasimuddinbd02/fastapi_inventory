from fastapi import FastAPI
from app.database import engine, Base
from app.routers import categories, suppliers, products, inventory, users
from app.logging_config import setup_logging
import logging

# Setup logging
setup_logging()
logger = logging.getLogger("app")

app = FastAPI(title="Cosmetics Inventory API", description="API for managing cosmetics inventory", version="1.0.0")

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

app.include_router(categories.router)
app.include_router(suppliers.router)
app.include_router(products.router)
app.include_router(inventory.router)
# app.include_router(users.router)  # Temporarily disabled