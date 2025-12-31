import importlib


def test_import_app_schemas_product():
    mod = importlib.import_module("app.schemas.product")
    assert mod is not None
