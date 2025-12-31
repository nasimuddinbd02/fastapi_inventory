import importlib


def test_import_app_viewmodels_category():
    mod = importlib.import_module("app.viewmodels.category")
    assert mod is not None
