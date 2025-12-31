import importlib


def test_import_app_services_supplier_service():
    mod = importlib.import_module("app.services.supplier_service")
    assert mod is not None
