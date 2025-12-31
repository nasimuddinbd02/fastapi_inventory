import importlib


def test_import_app_routers_categories():
    mod = importlib.import_module("app.routers.categories")
    assert mod is not None
