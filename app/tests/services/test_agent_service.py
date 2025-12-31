import importlib


def test_import_app_services_agent_service():
    mod = importlib.import_module("app.services.agent_service")
    assert mod is not None
