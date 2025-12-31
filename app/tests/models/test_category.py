import importlib


def test_import_app_models_category():
    mod = importlib.import_module("app.models.category")
    assert mod is not None
