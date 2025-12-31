import importlib


def test_import_app_schemas_category():
    mod = importlib.import_module("app.schemas.category")
    assert mod is not None
