import importlib


def test_import_app_viewmodels_user():
    mod = importlib.import_module("app.viewmodels.user")
    assert mod is not None
