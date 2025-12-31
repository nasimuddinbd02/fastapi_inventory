import importlib


def test_import_app_auth():
    assert importlib.import_module("app.auth") is not None


def test_import_app_database():
    assert importlib.import_module("app.database") is not None
