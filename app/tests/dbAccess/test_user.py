import importlib


def test_import_app_dbAccess_user():
    mod = importlib.import_module("app.dbAccess.user")
    assert mod is not None
