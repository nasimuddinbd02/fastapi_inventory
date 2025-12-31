import importlib


def test_import_app_services_product_service():
    mod = importlib.import_module("app.services.product_service")
    assert mod is not None
