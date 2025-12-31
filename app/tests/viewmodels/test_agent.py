import importlib


def test_import_app_viewmodels_agent():
    mod = importlib.import_module("app.viewmodels.agent")
    assert mod is not None
