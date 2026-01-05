from typing import Generic, TypeVar
from pydantic.generics import GenericModel

T = TypeVar("T")

class PaginatedResponse(GenericModel, Generic[T]):
    """Standard response model for paginated list endpoints."""

    items: list[T]
    total: int
    page: int
    page_size: int
