import importlib


def test_import_app_routers_suppliers():
    mod = importlib.import_module("app.routers.suppliers")
    assert mod is not None
