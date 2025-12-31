import importlib


def test_import_app_schemas_inventory():
    mod = importlib.import_module("app.schemas.inventory")
    assert mod is not None
