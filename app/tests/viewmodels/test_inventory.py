import importlib


def test_import_app_viewmodels_inventory():
    mod = importlib.import_module("app.viewmodels.inventory")
    assert mod is not None
