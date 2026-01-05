from app.models.dispatch import DispatchOrder, DispatchItem
from app.viewmodels.dispatch import DispatchOrderViewModel, DispatchItemViewModel


def map_dispatch_item_to_viewmodel(item: DispatchItem) -> DispatchItemViewModel:
    """Map DispatchItem model to viewmodel"""
    return DispatchItemViewModel(
        id=item.id,
        product_id=item.product_id,
        product_title=item.product.name if item.product else None,
        quantity=item.quantity,
        unit_price=item.unit_price,
        total_price=item.total_price
    )


def map_dispatch_order_to_viewmodel(order: DispatchOrder) -> DispatchOrderViewModel:
    """Map DispatchOrder model to viewmodel"""
    return DispatchOrderViewModel(
        id=order.id,
        dispatch_number=order.dispatch_number,
        dispatch_date=order.dispatch_date,
        customer_name=order.customer_name,
        status=order.status.value,
        subtotal=order.subtotal,
        tax_amount=order.tax_amount,
        total_amount=order.total_amount,
        payment_method=order.payment_method.value if order.payment_method else None,
        notes=order.notes,
        items=[map_dispatch_item_to_viewmodel(item) for item in order.items],
        created_at=order.created_at,
        updated_at=order.updated_at
    )
