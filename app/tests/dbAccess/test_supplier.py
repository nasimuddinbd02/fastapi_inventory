import importlib


def test_import_app_dbAccess_supplier():
    mod = importlib.import_module("app.dbAccess.supplier")
    assert mod is not None
