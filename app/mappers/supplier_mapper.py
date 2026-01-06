from app.viewmodels.supplier import (
    SupplierCreateViewModel, SupplierUpdateViewModel, SupplierViewModel
)
from app.schemas.supplier import SupplierCreate, SupplierUpdate, Supplier
import logging

from automapper import Mapper

mapper_logger = logging.getLogger("app.mappers.supplier_mapper")

# Create mapper instance

# Create mapper instance
mapper = Mapper()

def map_supplier_create_viewmodel_to_dto(viewmodel: SupplierCreateViewModel) -> SupplierCreate:
    """Map SupplierCreateViewModel to SupplierCreate DTO manually"""
    mapper_logger.debug(f"Mapping supplier create viewmodel: {viewmodel.supplier_name}")
    # Manual mapping
    result = SupplierCreate(
        name=viewmodel.supplier_name,
        contact_email=str(viewmodel.contact_email) if viewmodel.contact_email else None,
        contact_info=viewmodel.contact_info
    )
    mapper_logger.debug(f"Supplier create viewmodel mapped successfully: {viewmodel.supplier_name}")
    return result

def map_supplier_update_viewmodel_to_dto(viewmodel: SupplierUpdateViewModel) -> SupplierUpdate:
    """Map SupplierUpdateViewModel to SupplierUpdate DTO manually"""
    mapper_logger.debug("Mapping supplier update viewmodel")
    update_data = {}
    if viewmodel.supplier_name is not None:
        update_data["name"] = viewmodel.supplier_name
    if viewmodel.contact_email is not None:
        update_data["contact_email"] = str(viewmodel.contact_email)
    if viewmodel.contact_info is not None:
        update_data["contact_info"] = viewmodel.contact_info
        
    result = SupplierUpdate(**update_data)
    mapper_logger.debug("Supplier update viewmodel mapped successfully")
    return result

def map_supplier_to_viewmodel(supplier: Supplier) -> SupplierViewModel:
    """Map Supplier DTO to SupplierViewModel manually"""
    mapper_logger.debug(f"Mapping supplier to viewmodel: {supplier.name}")
    result = SupplierViewModel(
        id=supplier.id,
        supplier_name=supplier.name,
        contact_email=supplier.contact_email,
        contact_info=supplier.contact_info,
        created_at="N/A"
    )
    mapper_logger.debug(f"Supplier mapped to viewmodel: {supplier.name}")
    return result