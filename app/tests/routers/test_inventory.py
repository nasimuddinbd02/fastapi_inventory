import importlib


def test_import_app_routers_inventory():
    mod = importlib.import_module("app.routers.inventory")
    assert mod is not None
