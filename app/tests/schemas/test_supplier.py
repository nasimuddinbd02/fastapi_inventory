import importlib


def test_import_app_schemas_supplier():
    mod = importlib.import_module("app.schemas.supplier")
    assert mod is not None
