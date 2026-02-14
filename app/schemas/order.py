from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.product import ProductResponse
from app.schemas.shipment import ShipmentResponse

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItem(OrderItemBase):
    id: int
    price_at_purchase: float
    product: ProductResponse

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_amount: float
    status: str

class OrderCreate(BaseModel):
    pass # Currently no input needed, just triggers checkout from cart

class Order(OrderBase):
    id: int
    user_id: int
    shipping_address_id: int | None = None
    subtotal: float
    shipping_cost: float
    discount_amount: float
    coupon_code: str | None = None
    shipment: ShipmentResponse | None = None
    created_at: datetime
    items: List[OrderItem] = []

    class Config:
        from_attributes = True
