from typing import Optional
from pydantic import BaseModel

class PaymentCreate(BaseModel):
    pass

class PaymentVerify(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

class PaymentResponse(BaseModel):
    order_id: int
    razorpay_order_id: str
    amount: float
    currency: str
    key_id: Optional[str] = None # Helper to send key to frontend
