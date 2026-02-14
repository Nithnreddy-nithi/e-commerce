from fastapi import HTTPException, status
from app.repositories.cart_repo import CartRepository
from app.repositories.product_repo import ProductRepository
from app.models.cart import Cart, CartItem
from app.schemas.cart import CartItemCreate

class CartService:
    def __init__(self, cart_repo: CartRepository, product_repo: ProductRepository):
        self.cart_repo = cart_repo
        self.product_repo = product_repo

    async def get_my_cart(self, user_id: int) -> Cart:
        cart = await self.cart_repo.get_cart_by_user_id(user_id)
        if not cart:
            cart = await self.cart_repo.create_cart(user_id)
        return cart

    async def add_item(self, user_id: int, item_in: CartItemCreate) -> CartItem:
        cart = await self.get_my_cart(user_id)
        
        # 1. Start Validation: Product exists?
        product = await self.product_repo.get_product(item_in.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # 2. Check if item already in cart
        existing_item = await self.cart_repo.get_cart_item(cart.id, item_in.product_id)
        new_quantity = item_in.quantity
        if existing_item:
            new_quantity += existing_item.quantity
        
        # 3. Check Stock
        if product.stock_quantity < new_quantity:
            raise HTTPException(status_code=400, detail="Not enough stock available")

        # 4. Upsert
        if existing_item:
            return await self.cart_repo.update_item_quantity(existing_item, new_quantity)
        else:
            return await self.cart_repo.add_item(cart.id, item_in.product_id, item_in.quantity)

    async def remove_item(self, user_id: int, item_id: int):
        cart = await self.get_my_cart(user_id)
        # Ensure item belongs to user's cart
        item = await self.cart_repo.get_cart_item_by_id(item_id)
        if not item or item.cart_id != cart.id:
            raise HTTPException(status_code=404, detail="Item not found in your cart")
        
        await self.cart_repo.remove_item(item)

    async def update_item_quantity(self, user_id: int, item_id: int, quantity: int) -> Cart:
        cart = await self.get_my_cart(user_id)
        item = await self.cart_repo.get_cart_item_by_id(item_id)
        
        if not item or item.cart_id != cart.id:
            raise HTTPException(status_code=404, detail="Item not found")

        if quantity <= 0:
            await self.cart_repo.remove_item(item)
        else:
            # Check stock
            product = await self.product_repo.get_product(item.product_id)
            if product.stock_quantity < quantity:
                 raise HTTPException(status_code=400, detail=f"Not enough stock. Only {product.stock_quantity} available.")
            
            await self.cart_repo.update_item_quantity(item, quantity)
        
        return await self.get_my_cart(user_id)

    async def clear_cart(self, user_id: int):
        cart = await self.get_my_cart(user_id)
        await self.cart_repo.clear_cart(cart.id)
