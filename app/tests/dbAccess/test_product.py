import importlib


def test_import_app_dbAccess_product():
    mod = importlib.import_module("app.dbAccess.product")
    assert mod is not None
