from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select, func, delete as sql_delete
from sqlalchemy.orm import selectinload
from app.models.intake import IntakeOrder, IntakeItem, IntakeStatus
from app.models.product import Product
from app.models.inventory import Inventory
from typing import Optional, List, Tuple
from datetime import datetime, timezone


async def generate_intake_number(db: AsyncSession) -> str:
    """Generate unique intake number in format INT-YYYY-NNNN"""
    year = datetime.now(timezone.utc).year
    prefix = f"INT-{year}-"
    
    # Get the last intake order for this year
    result = await db.execute(
        select(IntakeOrder)
        .filter(IntakeOrder.intake_number.like(f"{prefix}%"))
        .order_by(desc(IntakeOrder.intake_number))
        .limit(1)
    )
    last_order = result.scalar_one_or_none()
    
    if last_order:
        last_number = int(last_order.intake_number.split("-")[-1])
        new_number = last_number + 1
    else:
        new_number = 1
    
    return f"{prefix}{new_number:04d}"


async def get_intake_orders(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None
) -> Tuple[List[IntakeOrder], int]:
    """Get paginated list of intake orders"""
    query = select(IntakeOrder).options(
        selectinload(IntakeOrder.supplier),
        selectinload(IntakeOrder.items).selectinload(IntakeItem.product)
    )
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(IntakeOrder.intake_number.ilike(search_pattern))
    
    # Get total count
    count_query = select(func.count()).select_from(IntakeOrder)
    if search:
        search_pattern = f"%{search}%"
        count_query = count_query.filter(IntakeOrder.intake_number.ilike(search_pattern))
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get paginated results
    query = query.order_by(desc(IntakeOrder.intake_date)).offset(skip).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return list(orders), total


async def get_intake_order_by_id(db: AsyncSession, order_id: int) -> Optional[IntakeOrder]:
    """Get intake order by ID with all relationships"""
    result = await db.execute(
        select(IntakeOrder)
        .options(
            selectinload(IntakeOrder.supplier),
            selectinload(IntakeOrder.items).selectinload(IntakeItem.product)
        )
        .filter(IntakeOrder.id == order_id)
    )
    return result.scalar_one_or_none()


async def create_intake_order(
    db: AsyncSession,
    intake_date: datetime,
    supplier_id: Optional[int],
    items_data: List[dict],
    notes: Optional[str],
    status: Optional[str] = None
) -> IntakeOrder:
    """Create new intake order"""
    # Generate intake number
    intake_number = await generate_intake_number(db)
    
    # Determine initial status
    if status and status == IntakeStatus.CONFIRMED.value:
        initial_status = IntakeStatus.CONFIRMED
    else:
        initial_status = IntakeStatus.DRAFT
    
    # Create order
    order = IntakeOrder(
        intake_number=intake_number,
        intake_date=intake_date,
        supplier_id=supplier_id,
        status=initial_status,
        notes=notes,
        total_cost=0
    )
    db.add(order)
    await db.flush()
    
    # Add items and calculate total
    total_cost = 0
    items = []  # Track created items
    for item_data in items_data:
        total_cost_item = item_data["quantity"] * item_data["unit_cost"]
        item = IntakeItem(
            intake_order_id=order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            unit_cost=item_data["unit_cost"],
            total_cost=total_cost_item
        )
        db.add(item)
        items.append(item)
        total_cost += total_cost_item
    
    order.total_cost = total_cost
    
    # If creating as confirmed, update inventory immediately
    if initial_status == IntakeStatus.CONFIRMED:
        await db.flush()  # Ensure items are saved before updating inventory
        # Update inventory for each item
        for item in items:
            result = await db.execute(
                select(Inventory).filter(Inventory.product_id == item.product_id)
            )
            inventory = result.scalar_one_or_none()
            
            if inventory:
                inventory.quantity += item.quantity
            else:
                # Create new inventory record
                inventory = Inventory(
                    product_id=item.product_id,
                    quantity=item.quantity
                )
                db.add(inventory)
    
    await db.commit()
    await db.refresh(order)
    
    return order


async def update_intake_order(
    db: AsyncSession,
    order_id: int,
    intake_date: Optional[datetime],
    supplier_id: Optional[int],
    status: Optional[str],
    items_data: Optional[List[dict]],
    notes: Optional[str]
) -> Optional[IntakeOrder]:
    """Update existing intake order"""
    order = await get_intake_order_by_id(db, order_id)
    if not order:
        return None
    
    # Don't allow editing confirmed orders
    if order.status == IntakeStatus.CONFIRMED:
        raise ValueError("Cannot edit confirmed intake orders")
    
    # Update basic fields
    if intake_date is not None:
        order.intake_date = intake_date
    if supplier_id is not None:
        order.supplier_id = supplier_id
    if notes is not None:
        order.notes = notes
    
    # Update items if provided
    if items_data is not None:
        # Delete existing items
        await db.execute(
            sql_delete(IntakeItem).filter(IntakeItem.intake_order_id == order_id)
        )
        
        # Add new items
        total_cost = 0
        for item_data in items_data:
            total_cost_item = item_data["quantity"] * item_data["unit_cost"]
            item = IntakeItem(
                intake_order_id=order.id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                unit_cost=item_data["unit_cost"],
                total_cost=total_cost_item
            )
            db.add(item)
            total_cost += total_cost_item
        
        order.total_cost = total_cost
    
    # Update status and handle inventory changes
    if status is not None and status != order.status:
        if status == IntakeStatus.CONFIRMED.value and order.status == IntakeStatus.DRAFT:
            # Confirm order - update inventory
            await _update_inventory_on_confirm(db, order)
        order.status = IntakeStatus(status)
    
    order.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(order)
    
    return order


async def _update_inventory_on_confirm(db: AsyncSession, order: IntakeOrder):
    """Update inventory quantities when intake order is confirmed"""
    for item in order.items:
        # Get or create inventory record
        result = await db.execute(
            select(Inventory).filter(Inventory.product_id == item.product_id)
        )
        inventory = result.scalar_one_or_none()
        
        if inventory:
            inventory.quantity += item.quantity
        else:
            # Create new inventory record
            inventory = Inventory(
                product_id=item.product_id,
                quantity=item.quantity
            )
            db.add(inventory)
    
    await db.flush()


async def delete_intake_order(db: AsyncSession, order_id: int) -> bool:
    """Delete intake order (only if not confirmed)"""
    order = await get_intake_order_by_id(db, order_id)
    if not order:
        return False
    
    if order.status == IntakeStatus.CONFIRMED:
        raise ValueError("Cannot delete confirmed intake orders")
    
    await db.delete(order)
    await db.commit()
    return True
