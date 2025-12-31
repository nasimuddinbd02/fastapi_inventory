import importlib


def test_import_app_dbAccess_inventory():
    mod = importlib.import_module("app.dbAccess.inventory")
    assert mod is not None
