from typing import List
from fastapi import HTTPException, status
from app.repositories.order_repo import OrderRepository
from app.repositories.cart_repo import CartRepository
from app.repositories.product_repo import ProductRepository
from app.models.order import Order, OrderItem, OrderStatus
from app.models.coupon import Coupon
from app.models.address import Address
from sqlalchemy.future import select
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class OrderService:
    def __init__(self, order_repo: OrderRepository, cart_repo: CartRepository, product_repo: ProductRepository):
        self.order_repo = order_repo
        self.cart_repo = cart_repo
        self.product_repo = product_repo
        self.session = order_repo.session 

    async def checkout(self, user_id: int, shipping_address_id: int | None = None, coupon_code: str | None = None) -> Order:
        # All operations happen in a single transaction managed by get_db()
        # 1. Get Cart
        cart = await self.cart_repo.get_cart_by_user_id(user_id)
        if not cart or not cart.items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        # 2. Prepare Order Data
        total_amount = 0.0
        order_items = []

        # 3. Process Items
        for cart_item in cart.items:
            product = cart_item.product
            
            if product.stock_quantity < cart_item.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Product {product.name} is out of stock (Requested: {cart_item.quantity}, Available: {product.stock_quantity})"
                )

            item_total = product.price * cart_item.quantity
            total_amount += item_total
            
            order_item = OrderItem(
                product_id=product.id,
                quantity=cart_item.quantity,
                price_at_purchase=product.price
            )
            order_items.append(order_item)

            # Deduct Stock (flush only, commit handled by get_db)
            await self.product_repo.decrease_stock(product.id, cart_item.quantity)

        # 4. Calculate Adjustments
        subtotal = total_amount
        discount_amount = 0.0
        shipping_cost = 0.0
        
        if shipping_address_id:
            result = await self.session.execute(select(Address).filter(Address.id == shipping_address_id, Address.user_id == user_id))
            address = result.scalars().first()
            if not address:
                raise HTTPException(status_code=404, detail="Shipping address not found")
            if subtotal < 500:
                shipping_cost = 50.0
        
        applied_coupon_code = None
        if coupon_code:
            result = await self.session.execute(select(Coupon).filter(Coupon.code == coupon_code, Coupon.is_active == True))
            coupon = result.scalars().first()
            if coupon:
                if coupon.valid_to and coupon.valid_to.replace(tzinfo=None) < datetime.utcnow():
                    raise HTTPException(status_code=400, detail="Coupon expired")
                
                if subtotal >= coupon.min_order_amount:
                    if coupon.discount_type == "percent":
                        discount_amount = (subtotal * coupon.value) / 100
                        if coupon.max_discount_amount:
                            discount_amount = min(discount_amount, coupon.max_discount_amount)
                    else:
                        discount_amount = coupon.value
                    
                    discount_amount = min(discount_amount, subtotal)
                    applied_coupon_code = coupon.code

        final_total = subtotal - discount_amount + shipping_cost

        # 5. Create Order (flush only)
        order = Order(
            user_id=user_id,
            total_amount=final_total,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            discount_amount=discount_amount,
            coupon_code=applied_coupon_code,
            shipping_address_id=shipping_address_id,
            status=OrderStatus.CONFIRMED,
            items=order_items
        )
        
        saved_order = await self.order_repo.create_order(order)

        # 6. Clear Cart (flush only)
        await self.cart_repo.clear_cart(cart.id)

        # get_db() will commit everything at end of request
        return saved_order

    async def get_my_orders(self, user_id: int) -> List[Order]:
        return await self.order_repo.get_orders_by_user(user_id)
