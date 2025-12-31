import importlib


def test_import_app_models_product():
    mod = importlib.import_module("app.models.product")
    assert mod is not None
