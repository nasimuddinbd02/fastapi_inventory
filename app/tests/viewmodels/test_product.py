import importlib


def test_import_app_viewmodels_product():
    mod = importlib.import_module("app.viewmodels.product")
    assert mod is not None
