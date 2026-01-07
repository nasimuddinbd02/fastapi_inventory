import asyncio
from app.database import SessionLocal
from app.models.product import Product
from app.models.inventory import Inventory
from sqlalchemy import select

# Import other models to ensure registry is okay
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.dispatch import DispatchOrder, DispatchItem
from app.models.intake import IntakeOrder, IntakeItem

async def check_inventory():
    async with SessionLocal() as db:
        # Check Product 1
        res = await db.execute(select(Product).where(Product.id == 1))
        product = res.scalars().first()
        if product:
            print(f"Product 1 Found: {product.name}")
            
            # Check Inventory for Product 1
            res_inv = await db.execute(select(Inventory).where(Inventory.product_id == 1))
            inventory = res_inv.scalars().first()
            if inventory:
                print(f"Inventory Found for Product 1: ID {inventory.id}, qty {inventory.quantity}")
            else:
                print("NO INVENTORY RECORD found for Product 1")
        else:
            print("Product 1 NOT FOUND")

if __name__ == "__main__":
    asyncio.run(check_inventory())
