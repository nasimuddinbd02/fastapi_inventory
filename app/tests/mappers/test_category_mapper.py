import importlib


def test_import_app_mappers_category_mapper():
    mod = importlib.import_module("app.mappers.category_mapper")
    assert mod is not None
