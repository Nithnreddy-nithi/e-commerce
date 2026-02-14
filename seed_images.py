import asyncio
import sys
from app.core.database import SessionLocal
from app.models.product import Product
from sqlalchemy import select

async def seed_images():
    async with SessionLocal() as session:
        result = await session.execute(select(Product))
        products = result.scalars().all()
        
        # Sample images
        images = [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80", # Watch
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80", # Headphones
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80", # Shoe
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=80", # Camera
            "https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&w=500&q=80", # Sunglasses
        ]
        
        for i, product in enumerate(products):
            product.image_url = images[i % len(images)]
            session.add(product)
        
        await session.commit()
        print(f"Updated {len(products)} products with images.")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_images())
