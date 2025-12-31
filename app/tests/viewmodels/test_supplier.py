import importlib


def test_import_app_viewmodels_supplier():
    mod = importlib.import_module("app.viewmodels.supplier")
    assert mod is not None
