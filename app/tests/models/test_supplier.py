import importlib


def test_import_app_models_supplier():
    mod = importlib.import_module("app.models.supplier")
    assert mod is not None
