import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Cosmetics Inventory API"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./inventory.db")
    
    # CORS
    # Parse CORS_ORIGINS from comma-separated string
    _cors_origins_str = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://localhost:3001"
    )
    CORS_ORIGINS: list[str] = [origin.strip() for origin in _cors_origins_str.split(",") if origin.strip()]

settings = Settings()
