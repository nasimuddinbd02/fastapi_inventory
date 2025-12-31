import importlib


def test_import_app_agents():
    mod = importlib.import_module("app.agents")
    assert mod is not None
