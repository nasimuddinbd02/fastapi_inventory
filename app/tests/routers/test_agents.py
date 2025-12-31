import importlib


def test_import_app_routers_agents():
    mod = importlib.import_module("app.routers.agents")
    assert mod is not None
