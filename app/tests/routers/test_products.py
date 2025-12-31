import importlib


def test_import_app_routers_products():
    mod = importlib.import_module("app.routers.products")
    assert mod is not None
