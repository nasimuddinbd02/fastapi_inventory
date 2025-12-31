import importlib


def test_import_app_dbAccess_category():
    mod = importlib.import_module("app.dbAccess.category")
    assert mod is not None
