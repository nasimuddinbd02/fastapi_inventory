import importlib


def test_import_app_dependencies():
    assert importlib.import_module("app.dependencies") is not None


def test_import_app_logging_and_exceptions():
    assert importlib.import_module("app.logging_config") is not None
    assert importlib.import_module("app.exceptions") is not None
    assert importlib.import_module("app.error_responses") is not None
