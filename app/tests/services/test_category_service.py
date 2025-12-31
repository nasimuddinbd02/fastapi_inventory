import importlib


def test_import_app_services_category_service():
    mod = importlib.import_module("app.services.category_service")
    assert mod is not None
