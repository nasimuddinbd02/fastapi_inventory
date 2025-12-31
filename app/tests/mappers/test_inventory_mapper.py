import importlib


def test_import_app_mappers_inventory_mapper():
    mod = importlib.import_module("app.mappers.inventory_mapper")
    assert mod is not None
