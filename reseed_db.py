import asyncio
import sys
import traceback
from app.core.database import SessionLocal, engine
from app.models.product import Product, Category
from sqlalchemy import select

async def reseed_db():
    try:
        print("Starting reseed script...", flush=True)
        async with SessionLocal() as session:
            print("Session created...", flush=True)
            
            # Check if categories exist
            print("Querying categories...", flush=True)
            result = await session.execute(select(Category))
            categories = result.scalars().all()
            print(f"Found {len(categories)} categories.", flush=True)
            
            if not categories:
                print("Creating categories...", flush=True)
                electronics = Category(name="Electronics", slug="electronics")
                clothing = Category(name="Clothing", slug="clothing")
                session.add(electronics)
                session.add(clothing)
                await session.commit()
                print("Categories committed.", flush=True)
                await session.refresh(electronics)
                await session.refresh(clothing)
            else:
                electronics = categories[0]
                clothing = categories[1] if len(categories) > 1 else categories[0]

            # Check if products exist
            print("Querying products...", flush=True)
            result = await session.execute(select(Product))
            products = result.scalars().all()
            print(f"Found {len(products)} products.", flush=True)
            
            if not products:
                print("Creating new products...", flush=True)
                p1 = Product(
                    name="Wireless Headphones",
                    description="High quality noise cancelling headphones.",
                    price=99.99,
                    stock_quantity=50,
                    category_id=electronics.id,
                    image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80"
                )
                p2 = Product(
                    name="Running Shoes",
                    description="Comfortable running shoes for daily use.",
                    price=59.99,
                    stock_quantity=100,
                    category_id=clothing.id,
                    image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80"
                )
                p3 = Product(
                    name="Smart Watch",
                    description="Track your fitness and notifications.",
                    price=199.99,
                    stock_quantity=30,
                    category_id=electronics.id,
                    image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
                )
                p4 = Product(
                    name="Camera",
                    description="DSLR Camera for professional photography.",
                    price=599.99,
                    stock_quantity=10,
                    category_id=electronics.id,
                    image_url="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=80"
                )
                p5 = Product(
                    name="Sunglasses",
                    description="Stylish sunglasses for summer.",
                    price=29.99,
                    stock_quantity=200,
                    category_id=clothing.id,
                    image_url="https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&w=500&q=80"
                )
                
                session.add_all([p1, p2, p3, p4, p5])
                await session.commit()
                print("Products created and committed.", flush=True)
            else:
                print("Checking for missing image URLs...", flush=True)
                updated = False
                for p in products:
                    if not p.image_url:
                        p.image_url = "https://via.placeholder.com/300"
                        updated = True
                if updated:
                    await session.commit()
                    print("Updated missing image URLs.", flush=True)
                else:
                    print("All products have images.", flush=True)
        
        await engine.dispose()
        print("Engine disposed. Script finished successfully.", flush=True)

    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(reseed_db())
