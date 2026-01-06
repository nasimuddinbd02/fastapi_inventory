
import asyncio
import random
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.category import Category
from app.database import async_session

# Sample cosmetics categories
COSMETICS_CATEGORIES = [
    "Foundation", "Concealer", "Powder", "Blush", "Bronzer", "Highlighter", "Primer", "Setting Spray", "BB Cream", "CC Cream",
    "Lipstick", "Lip Gloss", "Lip Liner", "Lip Balm", "Lip Stain", "Mascara", "Eyeliner", "Eyeshadow", "Brow Pencil", "Brow Gel",
    "Brow Powder", "Brow Pomade", "Eyelash Curler", "False Lashes", "Lash Glue", "Eye Primer", "Contour", "Face Palette", "Tinted Moisturizer", "Makeup Remover",
    "Micellar Water", "Cleansing Oil", "Cleansing Balm", "Face Wash", "Toner", "Essence", "Serum", "Moisturizer", "Face Oil", "Sunscreen",
    "Sheet Mask", "Clay Mask", "Peel-off Mask", "Exfoliator", "Scrub", "Peel", "Spot Treatment", "Acne Patch", "Night Cream", "Eye Cream",
    "Face Mist", "Setting Powder", "Loose Powder", "Pressed Powder", "Cushion Foundation", "Lip Tint", "Lip Oil", "Lip Plumper", "Lip Scrub", "Lip Mask",
    "Body Lotion", "Body Butter", "Body Oil", "Body Scrub", "Hand Cream", "Foot Cream", "Cuticle Oil", "Nail Polish", "Nail Polish Remover", "Base Coat",
    "Top Coat", "Nail Strengthener", "Perfume", "Body Mist", "Deodorant", "Shampoo", "Conditioner", "Hair Mask", "Hair Oil", "Hair Serum",
    "Hair Spray", "Dry Shampoo", "Hair Mousse", "Hair Gel", "Hair Wax", "Hair Pomade", "Hair Clay", "Hair Paste", "Hair Cream", "Heat Protectant",
    "Hair Color", "Root Touch Up", "Hair Bleach", "Hair Toner", "Scalp Scrub", "Scalp Serum", "Scalp Treatment", "Beard Oil", "Beard Balm", "Aftershave"
]

# Sample suppliers (cosmetics brands/distributors)
COSMETICS_SUPPLIERS = [
    "L'Oreal", "Maybelline", "Estée Lauder", "Revlon", "CoverGirl", "MAC Cosmetics", "Clinique", "Lancôme", "NARS", "Urban Decay",
    "Benefit Cosmetics", "Too Faced", "Tarte", "NYX", "e.l.f.", "Bobbi Brown", "Dior", "Chanel", "Yves Saint Laurent", "Guerlain",
    "Shiseido", "Laura Mercier", "Smashbox", "BareMinerals", "IT Cosmetics", "Charlotte Tilbury", "Pat McGrath Labs", "Fenty Beauty", "Glossier", "Huda Beauty",
    "KVD Beauty", "Anastasia Beverly Hills", "Hourglass", "Milk Makeup", "Morphe", "ColourPop", "Pixi", "Physicians Formula", "Milani", "Wet n Wild",
    "Rimmel", "No7", "Almay", "Sally Hansen", "OPI", "Essie", "Jo Malone", "The Body Shop", "Lush", "Bath & Body Works",
    "Aveeno", "Neutrogena", "Cetaphil", "CeraVe", "La Roche-Posay", "Vichy", "Bioderma", "Simple", "Garnier", "Nivea",
    "Vaseline", "Palmer's", "Jergens", "St. Ives", "Eucerin", "Aquaphor", "Olay", "Dove", "Suave", "Tresemmé",
    "Pantene", "Head & Shoulders", "Herbal Essences", "Aussie", "OGX", "John Frieda", "Redken", "Matrix", "Paul Mitchell", "Aveda",
    "Bumble and Bumble", "Oribe", "Living Proof", "Briogeo", "Kérastase", "Moroccanoil", "SheaMoisture", "Carol's Daughter", "Maui Moisture", "Not Your Mother's"
]

# Sample products (100, will repeat to reach 1000)
COSMETICS_PRODUCTS = [
    "L'Oreal Paris Voluminous Mascara", "Maybelline Fit Me Foundation", "Estée Lauder Double Wear Foundation", "Revlon Super Lustrous Lipstick", "MAC Studio Fix Powder Plus Foundation",
    "Clinique Dramatically Different Moisturizing Gel", "Lancôme Hypnôse Mascara", "NARS Radiant Creamy Concealer", "Urban Decay Naked Eyeshadow Palette", "Benefit Hoola Bronzer",
    "Too Faced Better Than Sex Mascara", "Tarte Shape Tape Concealer", "NYX Soft Matte Lip Cream", "e.l.f. Poreless Putty Primer", "Bobbi Brown Vitamin Enriched Face Base",
    "Dior Addict Lip Glow", "Chanel Le Volume Mascara", "YSL Touche Éclat Radiant Touch", "Guerlain Terracotta Bronzer", "Shiseido Ultimune Power Infusing Concentrate",
    "Laura Mercier Translucent Loose Setting Powder", "Smashbox Photo Finish Primer", "BareMinerals Original Foundation", "IT Cosmetics CC+ Cream", "Charlotte Tilbury Airbrush Flawless Finish Powder",
    "Pat McGrath Labs Mothership Palette", "Fenty Beauty Pro Filt'r Foundation", "Glossier Boy Brow", "Huda Beauty Easy Bake Loose Powder", "KVD Beauty Tattoo Liner",
    "Anastasia Beverly Hills Brow Wiz", "Hourglass Ambient Lighting Powder", "Milk Makeup Hydro Grip Primer", "Morphe Continuous Setting Mist", "ColourPop Super Shock Shadow",
    "Pixi Glow Tonic", "Physicians Formula Butter Bronzer", "Milani Baked Blush", "Wet n Wild Photo Focus Foundation", "Rimmel Stay Matte Powder",
    "No7 Lift & Luminate Triple Action Serum Foundation", "Almay Smart Shade Foundation", "Sally Hansen Miracle Gel", "OPI Nail Lacquer", "Essie Nail Polish",
    "Jo Malone Peony & Blush Suede Cologne", "The Body Shop Tea Tree Oil", "Lush Ocean Salt Face and Body Scrub", "Bath & Body Works Japanese Cherry Blossom Lotion", "Aveeno Daily Moisturizing Lotion",
    "Neutrogena Hydro Boost Water Gel", "Cetaphil Gentle Skin Cleanser", "CeraVe Hydrating Facial Cleanser", "La Roche-Posay Anthelios Sunscreen", "Vichy Mineral 89 Serum",
    "Bioderma Sensibio H2O Micellar Water", "Simple Kind to Skin Micellar Cleansing Water", "Garnier Micellar Cleansing Water", "Nivea Soft Moisturizing Cream", "Vaseline Lip Therapy",
    "Palmer's Cocoa Butter Formula", "Jergens Ultra Healing Lotion", "St. Ives Apricot Scrub", "Eucerin Advanced Repair Cream", "Aquaphor Healing Ointment",
    "Olay Regenerist Micro-Sculpting Cream", "Dove Beauty Bar", "Suave Professionals Shampoo", "Tresemmé Moisture Rich Conditioner", "Pantene Pro-V Daily Moisture Renewal Shampoo",
    "Head & Shoulders Classic Clean Shampoo", "Herbal Essences Bio:Renew Shampoo", "Aussie 3 Minute Miracle Moist Deep Conditioner", "OGX Renewing + Argan Oil of Morocco Shampoo", "John Frieda Frizz Ease Serum",
    "Redken All Soft Shampoo", "Matrix Biolage Hydrasource Shampoo", "Paul Mitchell Tea Tree Special Shampoo", "Aveda Shampure Nurturing Shampoo", "Bumble and Bumble Hairdresser's Invisible Oil",
    "Oribe Dry Texturizing Spray", "Living Proof Perfect Hair Day Dry Shampoo", "Briogeo Don't Despair, Repair! Deep Conditioning Mask", "Kérastase Nutritive 8H Magic Night Serum", "Moroccanoil Treatment",
    "SheaMoisture Coconut & Hibiscus Curl Enhancing Smoothie", "Carol's Daughter Black Vanilla Leave-In Conditioner", "Maui Moisture Heal & Hydrate + Shea Butter Shampoo", "Not Your Mother's Clean Freak Dry Shampoo", "L'Oreal Paris Elvive Total Repair 5 Shampoo"
]

def expand_list_to_length(lst, length):
    # Repeat and slice the list to reach the desired length
    return (lst * (length // len(lst) + 1))[:length]

async def seed_categories(session, n=100):
    categories = [Category(name=name) for name in expand_list_to_length(COSMETICS_CATEGORIES, n)]
    session.add_all(categories)
    await session.commit()
    return categories

async def seed_suppliers(session, n=300):
    suppliers = [Supplier(name=name, contact_email=f"contact@{name.replace(' ', '').replace('.', '').replace('&', '').replace('!', '').replace('’', '').replace("'", '').lower()}.com") for name in expand_list_to_length(COSMETICS_SUPPLIERS, n)]
    session.add_all(suppliers)
    await session.commit()
    return suppliers

async def seed_products(session, categories, suppliers, n=1000):
    products = []
    product_names = expand_list_to_length(COSMETICS_PRODUCTS, n)
    for i in range(n):
        category = categories[i % len(categories)]
        supplier = suppliers[i % len(suppliers)]
        product = Product(
            name=product_names[i],
            description=f"Sample {category.name} from {supplier.name}",
            price=round(random.uniform(5, 500), 2),
            category_id=category.id,
            supplier_id=supplier.id,
            sku=f"SKU-{1000+i:06d}",
            quantity=random.randint(1, 1000),
        )
        products.append(product)
    session.add_all(products)
    await session.commit()
    return products

async def main():
    async with async_session() as session:
        print("Seeding categories...")
        categories = await seed_categories(session)
        print("Seeding suppliers...")
        suppliers = await seed_suppliers(session)
        print("Seeding products...")
        await seed_products(session, categories, suppliers)
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
