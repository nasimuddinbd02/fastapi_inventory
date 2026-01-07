import asyncio
from app.database import SessionLocal
# Import all models to ensure registry is populated
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.dispatch import DispatchOrder, DispatchItem
from app.models.intake import IntakeOrder, IntakeItem
from app.services.agent_service import AgentService
from sqlalchemy import select

async def test_context():
    async with SessionLocal() as db:
        # Check raw count
        res = await db.execute(select(Product))
        products = res.scalars().all()
        print(f"Raw DB Product Count: {len(products)}")
        
        service = AgentService()
        try:
            context = await service.get_context_for_agents(db)
            print("Context Keys:", context.keys())
            print(f"Context Product Count: {len(context.get('products', []))}")
            if context.get('products'):
                print("First Product ID:", context['products'][0]['id'])
        except Exception as e:
            print(f"Service Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_context())
