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
    result = mapper.map(viewmodel, SupplierCreate)
    result.name = viewmodel.supplier_name
    result.contact_email = str(viewmodel.contact_email) if viewmodel.contact_email else None
    result.contact_info = viewmodel.contact_info
    mapper_logger.debug(f"Supplier create viewmodel mapped successfully: {viewmodel.supplier_name}")
    return result

def map_supplier_update_viewmodel_to_dto(viewmodel: SupplierUpdateViewModel) -> SupplierUpdate:
    """Map SupplierUpdateViewModel to SupplierUpdate DTO using py-automapper"""
    mapper_logger.debug("Mapping supplier update viewmodel")
    result = mapper.map(viewmodel, SupplierUpdate)
    if viewmodel.supplier_name is not None:
        result.name = viewmodel.supplier_name
    if viewmodel.contact_email is not None:
        result.contact_email = str(viewmodel.contact_email)
    if viewmodel.contact_info is not None:
        result.contact_info = viewmodel.contact_info
    mapper_logger.debug("Supplier update viewmodel mapped successfully")
    return result

def map_supplier_to_viewmodel(supplier: Supplier) -> SupplierViewModel:
    """Map Supplier DTO to SupplierViewModel using py-automapper"""
    mapper_logger.debug(f"Mapping supplier to viewmodel: {supplier.name}")
    result = mapper.map(supplier, SupplierViewModel)
    result.supplier_name = supplier.name
    result.contact_email = supplier.contact_email
    result.contact_info = supplier.contact_info
    result.created_at = "N/A"  # Suppliers don't have timestamps in current model
    mapper_logger.debug(f"Supplier mapped to viewmodel: {supplier.name}")
    return result