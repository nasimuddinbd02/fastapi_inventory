import importlib


def test_import_app_schemas_user():
    mod = importlib.import_module("app.schemas.user")
    assert mod is not None
