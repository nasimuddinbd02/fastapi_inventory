import importlib


def test_import_app_mappers_user_mapper():
    mod = importlib.import_module("app.mappers.user_mapper")
    assert mod is not None
