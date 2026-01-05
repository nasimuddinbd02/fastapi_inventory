from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum


class DispatchStatus(str, enum.Enum):
    DRAFT = "draft"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"


class DispatchOrder(Base):
    __tablename__ = "dispatch_orders"

    id = Column(Integer, primary_key=True, index=True)
    dispatch_number = Column(String(50), unique=True, nullable=False, index=True)
    dispatch_date = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    customer_name = Column(String(200), nullable=True)
    status = Column(SQLEnum(DispatchStatus), nullable=False, default=DispatchStatus.DRAFT)
    subtotal = Column(Numeric(10, 2), nullable=False, default=0)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    items = relationship("DispatchItem", back_populates="dispatch_order", cascade="all, delete-orphan")


class DispatchItem(Base):
    __tablename__ = "dispatch_items"

    id = Column(Integer, primary_key=True, index=True)
    dispatch_order_id = Column(Integer, ForeignKey("dispatch_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)

    # Relationships
    dispatch_order = relationship("DispatchOrder", back_populates="items")
    product = relationship("Product")
