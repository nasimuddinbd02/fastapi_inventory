import importlib


def test_import_app_mappers_product_mapper():
    mod = importlib.import_module("app.mappers.product_mapper")
    assert mod is not None
