import importlib


def test_import_app_services_user_service():
    mod = importlib.import_module("app.services.user_service")
    assert mod is not None
