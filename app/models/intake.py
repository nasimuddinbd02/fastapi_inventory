from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum


class IntakeStatus(str, enum.Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class IntakeOrder(Base):
    __tablename__ = "intake_orders"

    id = Column(Integer, primary_key=True, index=True)
    intake_number = Column(String(50), unique=True, nullable=False, index=True)
    intake_date = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    status = Column(SQLEnum(IntakeStatus), nullable=False, default=IntakeStatus.DRAFT)
    total_cost = Column(Numeric(10, 2), nullable=False, default=0)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    supplier = relationship("Supplier", back_populates="intake_orders")
    items = relationship("IntakeItem", back_populates="intake_order", cascade="all, delete-orphan")


class IntakeItem(Base):
    __tablename__ = "intake_items"

    id = Column(Integer, primary_key=True, index=True)
    intake_order_id = Column(Integer, ForeignKey("intake_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    total_cost = Column(Numeric(10, 2), nullable=False)

    # Relationships
    intake_order = relationship("IntakeOrder", back_populates="items")
    product = relationship("Product")
