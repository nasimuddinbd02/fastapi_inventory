import importlib


def test_import_app_services_inventory_service():
    mod = importlib.import_module("app.services.inventory_service")
    assert mod is not None
