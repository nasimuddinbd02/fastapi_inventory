from app.viewmodels.supplier import (
    SupplierCreateViewModel, SupplierUpdateViewModel, SupplierViewModel
)
from app.schemas.supplier import SupplierCreate, SupplierUpdate, Supplier
import logging

from automapper import Mapper

mapper_logger = logging.getLogger("app.mappers.supplier_mapper")

# Create mapper instance
mapper = Mapper()

def map_supplier_create_viewmodel_to_dto(viewmodel: SupplierCreateViewModel) -> SupplierCreate:
    """Map SupplierCreateViewModel to SupplierCreate DTO using py-automapper"""
    mapper_logger.debug(f"Mapping supplier create viewmodel: {viewmodel.supplier_name}")
    
    # Combine contact info from email and contact_info fields
    contact_parts = []
    if viewmodel.contact_email:
        contact_parts.append(f"Email: {viewmodel.contact_email}")
    if viewmodel.contact_info:
        contact_parts.append(viewmodel.contact_info)
    contact_info = "; ".join(contact_parts) if contact_parts else None

    result = SupplierCreate(
        name=viewmodel.supplier_name,
        contact_info=contact_info
    )
    mapper_logger.debug(f"Supplier create viewmodel mapped successfully: {viewmodel.supplier_name}")
    return result

def map_supplier_update_viewmodel_to_dto(viewmodel: SupplierUpdateViewModel) -> SupplierUpdate:
    """Map SupplierUpdateViewModel to SupplierUpdate DTO using py-automapper"""
    mapper_logger.debug("Mapping supplier update viewmodel")
    
    # Combine contact info from email and contact_info fields
    contact_parts = []
    if viewmodel.contact_email:
        contact_parts.append(f"Email: {viewmodel.contact_email}")
    if viewmodel.contact_info:
        contact_parts.append(viewmodel.contact_info)
    contact_info = "; ".join(contact_parts) if contact_parts else None

    update_data = {}
    if viewmodel.supplier_name is not None:
        update_data["name"] = viewmodel.supplier_name
    if contact_info is not None:
        update_data["contact_info"] = contact_info

    result = SupplierUpdate(**update_data)
    mapper_logger.debug("Supplier update viewmodel mapped successfully")
    return result

def map_supplier_to_viewmodel(supplier: Supplier) -> SupplierViewModel:
    """Map Supplier DTO to SupplierViewModel using py-automapper"""
    mapper_logger.debug(f"Mapping supplier to viewmodel: {supplier.name}")
    
    # Parse contact_info to extract email if present
    contact_email = None
    contact_info = supplier.contact_info

    if contact_info and "Email:" in contact_info:
        # Extract email from contact_info
        parts = contact_info.split("Email:")
        if len(parts) > 1:
            email_part = parts[1].split(";")[0].strip()
            contact_email = email_part
            # Remove email from contact_info for display
            contact_info = parts[0].strip().rstrip(";").strip()

    result = SupplierViewModel(
        id=supplier.id,
        supplier_name=supplier.name,
        contact_email=contact_email,
        contact_info=contact_info,
        created_at="N/A"  # Suppliers don't have timestamps in current model
    )
    mapper_logger.debug(f"Supplier mapped to viewmodel: {supplier.name}")
    return result