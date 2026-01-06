import logging
import logging.config
from typing import Dict, Any

def setup_logging() -> None:
    """Configure logging for the application"""
    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "level": "INFO"
            },
            "file": {
                "class": "logging.FileHandler",
                "filename": "app.log",
                "formatter": "detailed",
                "level": "DEBUG"
            }
        },
        "loggers": {
            "app": {
                "handlers": ["console", "file"],
                "level": "DEBUG",
                "propagate": False
            },
            "app.routers": {
                "handlers": ["console", "file"],
                "level": "INFO",
                "propagate": False
            },
            "app.services": {
                "handlers": ["console", "file"],
                "level": "INFO",
                "propagate": False
            },
            "app.dbAccess": {
                "handlers": ["console", "file"],
                "level": "DEBUG",
                "propagate": False
            },
            "app.mappers": {
                "handlers": ["console", "file"],
                "level": "DEBUG",
                "propagate": False
            }
        },
        "root": {
            "handlers": ["console", "file"],
            "level": "WARNING"
        }
    }

    logging.config.dictConfig(logging_config)

# Create logger instances for different modules
logger = logging.getLogger("app")
router_logger = logging.getLogger("app.routers")
service_logger = logging.getLogger("app.services")
db_logger = logging.getLogger("app.dbAccess")
mapper_logger = logging.getLogger("app.mappers")