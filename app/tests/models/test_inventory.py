import importlib


def test_import_app_models_inventory():
    mod = importlib.import_module("app.models.inventory")
    assert mod is not None
