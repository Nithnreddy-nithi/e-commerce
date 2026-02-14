"""
Seed script to populate the database with real products and categories.
Run with: python seed_products.py
"""
import asyncio
from app.core.database import engine, SessionLocal, Base
from app.models.product import Category, Product
from sqlalchemy import select

CATEGORIES = [
    {"name": "Electronics", "slug": "electronics"},
    {"name": "Clothing", "slug": "clothing"},
    {"name": "Home & Kitchen", "slug": "home-kitchen"},
    {"name": "Books", "slug": "books"},
    {"name": "Sports & Fitness", "slug": "sports-fitness"},
    {"name": "Beauty & Personal Care", "slug": "beauty-personal-care"},
]

PRODUCTS = [
    # Electronics
    {
        "name": "Apple iPhone 15 Pro Max",
        "description": "6.7-inch Super Retina XDR OLED display, A17 Pro chip, 48MP camera system with 5x optical zoom, titanium design, USB-C, and up to 29 hours of video playback.",
        "price": 134900.00,
        "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
        "stock_quantity": 25,
        "category_slug": "electronics",
    },
    {
        "name": "Samsung Galaxy S24 Ultra",
        "description": "6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 processor, 200MP camera, built-in S Pen, Galaxy AI features, and 5000mAh battery.",
        "price": 129999.00,
        "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop",
        "stock_quantity": 30,
        "category_slug": "electronics",
    },
    {
        "name": "Sony WH-1000XM5 Headphones",
        "description": "Industry-leading noise cancellation, 30-hour battery life, crystal clear hands-free calling, and exceptionally comfortable lightweight design.",
        "price": 29990.00,
        "image_url": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop",
        "stock_quantity": 50,
        "category_slug": "electronics",
    },
    {
        "name": "MacBook Air M3 15-inch",
        "description": "15.3-inch Liquid Retina display, Apple M3 chip with 8-core CPU, 10-core GPU, 16GB unified memory, 512GB SSD, 18-hour battery life.",
        "price": 149900.00,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
        "stock_quantity": 15,
        "category_slug": "electronics",
    },
    {
        "name": "JBL Flip 6 Bluetooth Speaker",
        "description": "Portable waterproof speaker with powerful JBL Original Pro Sound, IP67 dustproof and waterproof, 12 hours of playtime, and PartyBoost feature.",
        "price": 9999.00,
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
        "stock_quantity": 75,
        "category_slug": "electronics",
    },

    # Clothing
    {
        "name": "Levi's 501 Original Fit Jeans",
        "description": "The iconic straight fit jean since 1873. Made with premium denim, button fly, and a timeless look that goes with everything.",
        "price": 3999.00,
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
        "stock_quantity": 100,
        "category_slug": "clothing",
    },
    {
        "name": "Nike Air Max 270 Sneakers",
        "description": "Featuring Nike's biggest Air unit yet for a super-soft ride. Breathable mesh upper, foam midsole, and iconic 270-degree Air unit in the heel.",
        "price": 12995.00,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
        "stock_quantity": 60,
        "category_slug": "clothing",
    },
    {
        "name": "Classic Cotton Polo T-Shirt",
        "description": "Premium 100% cotton polo with ribbed collar and cuffs, two-button placket, and a relaxed fit perfect for casual and semi-formal occasions.",
        "price": 1499.00,
        "image_url": "https://images.unsplash.com/photo-1625910513413-5fc929d19002?w=600&h=600&fit=crop",
        "stock_quantity": 200,
        "category_slug": "clothing",
    },
    {
        "name": "Ray-Ban Aviator Sunglasses",
        "description": "Classic aviator style with gold metal frame, polarized green G-15 lenses for true color perception, and 100% UV protection.",
        "price": 7890.00,
        "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
        "stock_quantity": 45,
        "category_slug": "clothing",
    },

    # Home & Kitchen
    {
        "name": "Instant Pot Duo 7-in-1 Cooker",
        "description": "Multi-use programmable pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. 6-quart capacity.",
        "price": 8999.00,
        "image_url": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=600&fit=crop",
        "stock_quantity": 40,
        "category_slug": "home-kitchen",
    },
    {
        "name": "Dyson V15 Detect Vacuum",
        "description": "Laser reveals microscopic dust. Piezo sensor counts and sizes particles. Powerful Dyson Hyperdymium motor with up to 60 minutes of run time.",
        "price": 52990.00,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop",
        "stock_quantity": 20,
        "category_slug": "home-kitchen",
    },
    {
        "name": "Ceramic Non-Stick Cookware Set",
        "description": "10-piece premium ceramic-coated cookware set including fry pans, saucepans, and stockpot. PFOA-free, oven safe up to 450°F.",
        "price": 5999.00,
        "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop",
        "stock_quantity": 35,
        "category_slug": "home-kitchen",
    },
    {
        "name": "Philips Air Fryer XXL",
        "description": "Family-sized air fryer with Rapid Air technology. Fry, bake, grill, and roast with up to 90% less fat. 7.3L capacity, digital touchscreen.",
        "price": 14999.00,
        "image_url": "https://images.unsplash.com/photo-1648445538804-4a4fb9e0a70c?w=600&h=600&fit=crop",
        "stock_quantity": 55,
        "category_slug": "home-kitchen",
    },

    # Books
    {
        "name": "Atomic Habits by James Clear",
        "description": "An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results. #1 New York Times bestseller.",
        "price": 499.00,
        "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop",
        "stock_quantity": 150,
        "category_slug": "books",
    },
    {
        "name": "The Psychology of Money",
        "description": "By Morgan Housel. Timeless lessons on wealth, greed, and happiness. 19 short stories exploring the strange ways people think about money.",
        "price": 350.00,
        "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop",
        "stock_quantity": 120,
        "category_slug": "books",
    },
    {
        "name": "Clean Code by Robert C. Martin",
        "description": "A handbook of agile software craftsmanship. Learn to write clean, maintainable code with real-world examples and best practices from industry experts.",
        "price": 2999.00,
        "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop",
        "stock_quantity": 80,
        "category_slug": "books",
    },

    # Sports & Fitness
    {
        "name": "Yoga Mat Premium 6mm",
        "description": "Extra thick 6mm eco-friendly TPE yoga mat with alignment lines. Non-slip surface, lightweight, and comes with carrying strap.",
        "price": 1299.00,
        "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop",
        "stock_quantity": 90,
        "category_slug": "sports-fitness",
    },
    {
        "name": "Adjustable Dumbbell Set 24kg",
        "description": "Space-saving adjustable dumbbells replacing 15 sets of weights. Quick-change mechanism, ergonomic handle, and durable steel construction.",
        "price": 8499.00,
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop",
        "stock_quantity": 30,
        "category_slug": "sports-fitness",
    },
    {
        "name": "Fitbit Charge 6 Fitness Tracker",
        "description": "Advanced health and fitness tracker with built-in GPS, heart rate monitoring, sleep tracking, stress management, and 7-day battery life.",
        "price": 14999.00,
        "image_url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop",
        "stock_quantity": 40,
        "category_slug": "sports-fitness",
    },

    # Beauty & Personal Care
    {
        "name": "The Ordinary Niacinamide 10% Serum",
        "description": "High-strength vitamin and mineral blemish formula. Targets blemishes, congestion, and excess oil. Cruelty-free, vegan, 30ml.",
        "price": 590.00,
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop",
        "stock_quantity": 200,
        "category_slug": "beauty-personal-care",
    },
    {
        "name": "Dyson Airwrap Multi-Styler",
        "description": "Complete hair styling tool that curls, waves, smooths, and dries with no extreme heat. Uses Coanda airflow technology for salon-quality results.",
        "price": 45990.00,
        "image_url": "https://images.unsplash.com/photo-1522338242992-e1a54571a431?w=600&h=600&fit=crop",
        "stock_quantity": 15,
        "category_slug": "beauty-personal-care",
    },
    {
        "name": "Luxury Perfume Gift Set",
        "description": "Collection of 4 premium fragrances in elegant 30ml bottles. Includes floral, woody, citrus, and oriental notes. Perfect gift set.",
        "price": 3499.00,
        "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop",
        "stock_quantity": 60,
        "category_slug": "beauty-personal-care",
    },
]


async def seed():
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # Check if data already exists
        result = await db.execute(select(Product))
        existing = result.scalars().first()
        if existing:
            print("Products already exist. Clearing and re-seeding...")
            await db.execute(Product.__table__.delete())
            await db.execute(Category.__table__.delete())
            await db.commit()

        # Insert categories
        category_map = {}
        for cat_data in CATEGORIES:
            cat = Category(name=cat_data["name"], slug=cat_data["slug"])
            db.add(cat)
            await db.flush()
            category_map[cat_data["slug"]] = cat.id
            print(f"  + Category: {cat_data['name']} (id={cat.id})")

        # Insert products
        for prod_data in PRODUCTS:
            slug = prod_data.pop("category_slug")
            prod = Product(
                name=prod_data["name"],
                description=prod_data["description"],
                price=prod_data["price"],
                image_url=prod_data["image_url"],
                stock_quantity=prod_data["stock_quantity"],
                is_active=True,
                category_id=category_map[slug],
            )
            db.add(prod)
            print(f"  + Product: {prod_data['name']} — ₹{prod_data['price']}")

        await db.commit()
        print(f"\nDone! Seeded {len(CATEGORIES)} categories and {len(PRODUCTS)} products.")


if __name__ == "__main__":
    asyncio.run(seed())
