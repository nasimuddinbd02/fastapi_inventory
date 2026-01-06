import asyncio
import httpx

API_URL = "http://localhost:8000"

# Sample data (same as previous patch, truncated for brevity)
CATEGORIES = [
    "Foundation", "Concealer", "Powder", "Blush", "Bronzer", "Highlighter", "Primer", "Setting Spray", "BB Cream", "CC Cream",
    # ... (add up to 100)
]
SUPPLIERS = [
    "L'Oreal", "Maybelline", "Estée Lauder", "Revlon", "CoverGirl", "MAC Cosmetics", "Clinique", "Lancôme", "NARS", "Urban Decay",
    # ... (add up to 300)
]
PRODUCTS = [
    "L'Oreal Paris Voluminous Mascara", "Maybelline Fit Me Foundation", "Estée Lauder Double Wear Foundation", "Revlon Super Lustrous Lipstick", "MAC Studio Fix Powder Plus Foundation",
    # ... (add up to 100, repeat to 1000)
]

def expand_list_to_length(lst, length):
    return (lst * (length // len(lst) + 1))[:length]

async def seed_categories(client):
    for name in expand_list_to_length(CATEGORIES, 100):
        await client.post(f"{API_URL}/categories/", json={"category_name": name, "category_description": f"Sample {name}"})

async def seed_suppliers(client):
    for name in expand_list_to_length(SUPPLIERS, 300):
        await client.post(f"{API_URL}/suppliers/", json={"supplier_name": name, "contact_email": f"contact@{name.replace(' ', '').replace('.', '').replace('&', '').replace('!', '').replace('’', '').replace("'", '').lower()}.com"})

async def seed_products(client):
    categories = expand_list_to_length(CATEGORIES, 100)
    suppliers = expand_list_to_length(SUPPLIERS, 300)
    product_names = expand_list_to_length(PRODUCTS, 1000)
    for i in range(1000):
        await client.post(f"{API_URL}/products/", json={
            "product_title": product_names[i],
            "product_description": f"Sample {categories[i%100]} from {suppliers[i%300]}",
            "unit_price": round(10 + i % 50, 2),
            "category_name": categories[i%100],
            "supplier_name": suppliers[i%300],
        })

async def main():
    async with httpx.AsyncClient() as client:
        print("Seeding categories...")
        await seed_categories(client)
        print("Seeding suppliers...")
        await seed_suppliers(client)
        print("Seeding products...")
        await seed_products(client)
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
