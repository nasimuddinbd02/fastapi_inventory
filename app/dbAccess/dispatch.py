from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select, func, delete as sql_delete
from sqlalchemy.orm import selectinload
from app.models.dispatch import DispatchOrder, DispatchItem, DispatchStatus
from app.models.product import Product
from app.models.inventory import Inventory
from typing import Optional, List, Tuple
from datetime import datetime, timezone
from decimal import Decimal


async def generate_dispatch_number(db: AsyncSession) -> str:
    """Generate unique dispatch number in format DSP-YYYY-NNNN"""
    year = datetime.now(timezone.utc).year
    prefix = f"DSP-{year}-"
    
    # Get the last dispatch order for this year
    result = await db.execute(
        select(DispatchOrder)
        .filter(DispatchOrder.dispatch_number.like(f"{prefix}%"))
        .order_by(desc(DispatchOrder.dispatch_number))
        .limit(1)
    )
    last_order = result.scalar_one_or_none()
    
    if last_order:
        last_number = int(last_order.dispatch_number.split("-")[-1])
        new_number = last_number + 1
    else:
        new_number = 1
    
    return f"{prefix}{new_number:04d}"


async def get_dispatch_orders(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None
) -> Tuple[List[DispatchOrder], int]:
    """Get paginated list of dispatch orders"""
    query = select(DispatchOrder).options(
        selectinload(DispatchOrder.items).selectinload(DispatchItem.product)
    )
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (DispatchOrder.dispatch_number.ilike(search_pattern)) |
            (DispatchOrder.customer_name.ilike(search_pattern))
        )
    
    # Get total count
    count_query = select(func.count()).select_from(DispatchOrder)
    if search:
        search_pattern = f"%{search}%"
        count_query = count_query.filter(
            (DispatchOrder.dispatch_number.ilike(search_pattern)) |
            (DispatchOrder.customer_name.ilike(search_pattern))
        )
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get paginated results
    query = query.order_by(desc(DispatchOrder.dispatch_date)).offset(skip).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return list(orders), total


async def get_dispatch_order_by_id(db: AsyncSession, order_id: int) -> Optional[DispatchOrder]:
    """Get dispatch order by ID with all relationships"""
    result = await db.execute(
        select(DispatchOrder)
        .options(selectinload(DispatchOrder.items).selectinload(DispatchItem.product))
        .filter(DispatchOrder.id == order_id)
    )
    return result.scalar_one_or_none()


async def create_dispatch_order(
    db: AsyncSession,
    dispatch_date: datetime,
    customer_name: Optional[str],
    payment_method: Optional[str],
    items_data: List[dict],
    notes: Optional[str],
    tax_rate: Decimal = Decimal("0.10"),
    status: Optional[str] = None
) -> DispatchOrder:
    """Create new dispatch order"""
    # Generate dispatch number
    dispatch_number = await generate_dispatch_number(db)
    
    # Determine initial status
    if status and status == 'completed':
        initial_status = DispatchStatus.COMPLETED
    elif status and status == 'draft':
        initial_status = DispatchStatus.DRAFT
    else:
        initial_status = DispatchStatus.DRAFT
    
    # Calculate totals and validate stock if completing
    subtotal = Decimal("0")
    for item_data in items_data:
        # Only check stock availability if creating as completed
        if initial_status == DispatchStatus.COMPLETED:
            result = await db.execute(
                select(Inventory).filter(Inventory.product_id == item_data["product_id"])
            )
            inventory = result.scalar_one_or_none()
            
            if not inventory or inventory.quantity < item_data["quantity"]:
                product_result = await db.execute(
                    select(Product).filter(Product.id == item_data["product_id"])
                )
                product = product_result.scalar_one_or_none()
                product_name = product.name if product else f"Product #{item_data['product_id']}"
                available = inventory.quantity if inventory else 0
                raise ValueError(
                    f"Insufficient stock for {product_name}. "
                    f"Requested: {item_data['quantity']}, Available: {available}"
                )
        
        subtotal += item_data["quantity"] * item_data["unit_price"]
    
    tax_amount = subtotal * tax_rate
    total_amount = subtotal + tax_amount
    
    # Create order
    order = DispatchOrder(
        dispatch_number=dispatch_number,
        dispatch_date=dispatch_date,
        customer_name=customer_name,
        status=initial_status,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total_amount=total_amount,
        payment_method=payment_method,
        notes=notes
    )
    db.add(order)
    await db.flush()
    
    # Add items
    for item_data in items_data:
        total_price_item = item_data["quantity"] * item_data["unit_price"]
        item = DispatchItem(
            dispatch_order_id=order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            total_price=total_price_item
        )
        db.add(item)
    
    await db.flush()  # Flush to save items
    
    # Load items relationship for the order
    await db.refresh(order, ['items'])
    
    # Store order ID before commit (to avoid expired state access)
    order_id = order.id
    
    # If creating as completed, update inventory immediately
    if initial_status == DispatchStatus.COMPLETED:
        await _update_inventory_on_complete(db, order)
    
    await db.commit()
    
    # Reload order with all relationships using the stored ID
    result = await db.execute(
        select(DispatchOrder)
        .options(selectinload(DispatchOrder.items).selectinload(DispatchItem.product))
        .filter(DispatchOrder.id == order_id)
    )
    order = result.scalar_one()
    
    return order


async def update_dispatch_order(
    db: AsyncSession,
    order_id: int,
    dispatch_date: Optional[datetime],
    customer_name: Optional[str],
    status: Optional[str],
    payment_method: Optional[str],
    items_data: Optional[List[dict]],
    notes: Optional[str],
    tax_rate: Optional[Decimal] = None
) -> Optional[DispatchOrder]:
    """Update existing dispatch order"""
    order = await get_dispatch_order_by_id(db, order_id)
    if not order:
        return None
    
    # Don't allow editing completed orders
    if order.status == DispatchStatus.COMPLETED:
        raise ValueError("Cannot edit completed dispatch orders")
    
    # Update basic fields
    if dispatch_date is not None:
        order.dispatch_date = dispatch_date
    if customer_name is not None:
        order.customer_name = customer_name
    if payment_method is not None:
        order.payment_method = payment_method
    if notes is not None:
        order.notes = notes
    
    # Update items if provided
    if items_data is not None:
        # Validate stock for new items
        for item_data in items_data:
            result = await db.execute(
                select(Inventory).filter(Inventory.product_id == item_data["product_id"])
            )
            inventory = result.scalar_one_or_none()
            
            if not inventory or inventory.quantity < item_data["quantity"]:
                product_result = await db.execute(
                    select(Product).filter(Product.id == item_data["product_id"])
                )
                product = product_result.scalar_one_or_none()
                product_name = product.name if product else f"Product #{item_data['product_id']}"
                available = inventory.quantity if inventory else 0
                raise ValueError(
                    f"Insufficient stock for {product_name}. "
                    f"Requested: {item_data['quantity']}, Available: {available}"
                )
        
        # Delete existing items
        await db.execute(
            sql_delete(DispatchItem).filter(DispatchItem.dispatch_order_id == order_id)
        )
        
        # Calculate new totals
        subtotal = Decimal("0")
        for item_data in items_data:
            total_price_item = item_data["quantity"] * item_data["unit_price"]
            item = DispatchItem(
                dispatch_order_id=order.id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=total_price_item
            )
            db.add(item)
            subtotal += total_price_item
        
        # Update totals
        if tax_rate is None:
            tax_rate = order.tax_amount / order.subtotal if order.subtotal > 0 else Decimal("0.10")
        
        order.subtotal = subtotal
        order.tax_amount = subtotal * tax_rate
        order.total_amount = subtotal + order.tax_amount
    
    # Update status and handle inventory changes
    if status is not None and status != order.status:
        if status == DispatchStatus.COMPLETED.value and order.status == DispatchStatus.DRAFT:
            # Complete order - update inventory
            await _update_inventory_on_complete(db, order)
        order.status = DispatchStatus(status)
    
    order.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(order)
    
    return order


async def _update_inventory_on_complete(db: AsyncSession, order: DispatchOrder):
    """Update inventory quantities when dispatch order is completed"""
    for item in order.items:
        result = await db.execute(
            select(Inventory).filter(Inventory.product_id == item.product_id)
        )
        inventory = result.scalar_one_or_none()
        
        if inventory:
            inventory.quantity -= item.quantity
            if inventory.quantity < 0:
                inventory.quantity = 0
        
    await db.flush()


async def delete_dispatch_order(db: AsyncSession, order_id: int) -> bool:
    """Delete dispatch order (only if not completed)"""
    order = await get_dispatch_order_by_id(db, order_id)
    if not order:
        return False
    
    if order.status == DispatchStatus.COMPLETED:
        raise ValueError("Cannot delete completed dispatch orders")
    
    await db.delete(order)
    await db.commit()
    return True
