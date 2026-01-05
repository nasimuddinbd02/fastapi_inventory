from app.models.intake import IntakeOrder, IntakeItem
from app.viewmodels.intake import IntakeOrderViewModel, IntakeItemViewModel


def map_intake_item_to_viewmodel(item: IntakeItem) -> IntakeItemViewModel:
    """Map IntakeItem model to viewmodel"""
    return IntakeItemViewModel(
        id=item.id,
        product_id=item.product_id,
        product_title=item.product.name if item.product else None,
        quantity=item.quantity,
        unit_cost=item.unit_cost,
        total_cost=item.total_cost
    )


def map_intake_order_to_viewmodel(order: IntakeOrder) -> IntakeOrderViewModel:
    """Map IntakeOrder model to viewmodel"""
    return IntakeOrderViewModel(
        id=order.id,
        intake_number=order.intake_number,
        intake_date=order.intake_date,
        supplier_id=order.supplier_id,
        supplier_name=order.supplier.name if order.supplier else None,
        status=order.status.value,
        total_cost=order.total_cost,
        notes=order.notes,
        items=[map_intake_item_to_viewmodel(item) for item in order.items],
        created_at=order.created_at,
        updated_at=order.updated_at
    )
