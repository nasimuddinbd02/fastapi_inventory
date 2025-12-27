from fastapi import HTTPException
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger("app.exceptions")

class AppException(Exception):
    """Base exception class for application errors"""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or f"ERROR_{status_code}"
        self.details = details or {}
        super().__init__(self.message)

class ValidationError(AppException):
    """Exception for validation errors"""

    def __init__(self, message: str, field: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=400,
            error_code="VALIDATION_ERROR",
            details={"field": field, **(details or {})}
        )

class NotFoundError(AppException):
    """Exception for resource not found errors"""

    def __init__(self, resource: str, resource_id: Optional[Any] = None, details: Optional[Dict[str, Any]] = None):
        message = f"{resource} not found"
        if resource_id is not None:
            message += f" with ID: {resource_id}"
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
            details={"resource": resource, "resource_id": resource_id, **(details or {})}
        )

class ConflictError(AppException):
    """Exception for resource conflicts (e.g., duplicate entries)"""

    def __init__(self, message: str, resource: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=409,
            error_code="CONFLICT",
            details={"resource": resource, **(details or {})}
        )

class AuthenticationError(AppException):
    """Exception for authentication errors"""

    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR",
            details=details or {}
        )

class AuthorizationError(AppException):
    """Exception for authorization errors"""

    def __init__(self, message: str = "Insufficient permissions", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
            details=details or {}
        )

class BusinessLogicError(AppException):
    """Exception for business logic violations"""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=400,
            error_code="BUSINESS_LOGIC_ERROR",
            details=details or {}
        )

class DatabaseError(AppException):
    """Exception for database-related errors"""

    def __init__(self, message: str = "Database operation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=500,
            error_code="DATABASE_ERROR",
            details=details or {}
        )

class ExternalServiceError(AppException):
    """Exception for external service errors"""

    def __init__(self, service: str, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=f"External service error ({service}): {message}",
            status_code=502,
            error_code="EXTERNAL_SERVICE_ERROR",
            details={"service": service, **(details or {})}
        )