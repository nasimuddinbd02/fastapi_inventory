from pydantic import BaseModel
from typing import Any, Dict, Optional
from datetime import datetime,timezone

class ErrorDetail(BaseModel):
    """Detailed error information"""
    field: Optional[str] = None
    message: str
    code: Optional[str] = None

class ErrorResponse(BaseModel):
    """Standard error response model"""
    success: bool = False
    error: Dict[str, Any] = {}
    timestamp: str
    request_id: Optional[str] = None
    path: Optional[str] = None

    @classmethod
    def create(
        cls,
        message: str,
        error_code: str,
        status_code: int,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        path: Optional[str] = None
    ) -> "ErrorResponse":
        """Create an error response with current timestamp"""
        return cls(
            error={
                "message": message,
                "code": error_code,
                "status_code": status_code,
                "details": details or {}
            },
            timestamp=datetime.now(timezone.utc).isoformat() + "Z",
            request_id=request_id,
            path=path
        )

class ValidationErrorResponse(ErrorResponse):
    """Response for validation errors with field details"""

    @classmethod
    def create(
        cls,
        message: str,
        field_errors: list[ErrorDetail],
        request_id: Optional[str] = None,
        path: Optional[str] = None
    ) -> "ValidationErrorResponse":
        """Create a validation error response"""
        return cls(
            error={
                "message": message,
                "code": "VALIDATION_ERROR",
                "status_code": 400,
                "details": {
                    "field_errors": [error.dict() for error in field_errors]
                }
            },
            timestamp=datetime.now(timezone.utc).isoformat() + "Z",
            request_id=request_id,
            path=path
        )