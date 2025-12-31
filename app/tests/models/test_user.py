import importlib


def test_import_app_models_user():
    mod = importlib.import_module("app.models.user")
    assert mod is not None
