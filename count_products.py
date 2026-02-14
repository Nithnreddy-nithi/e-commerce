import asyncio
import sys
from app.core.database import SessionLocal
from app.models.product import Product
from sqlalchemy import select, func

async def count_products():
    async with SessionLocal() as session:
        result = await session.execute(select(func.count(Product.id)))
        count = result.scalar()
        print(f"Total Products: {count}")
        
        if count > 0:
            result = await session.execute(select(Product).limit(3))
            products = result.scalars().all()
            for p in products:
                print(f"Product: {p.id}, {p.name}, Image: {p.image_url}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(count_products())
