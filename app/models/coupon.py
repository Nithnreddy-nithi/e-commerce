from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    
    discount_type = Column(String(20), default="percent") # percent, flat
    value = Column(Float, nullable=False) # e.g. 10.0
    
    min_order_amount = Column(Float, default=0.0)
    max_discount_amount = Column(Float, nullable=True) # Cap for percent discount
    
    valid_from = Column(DateTime(timezone=True), nullable=True)
    valid_to = Column(DateTime(timezone=True), nullable=True)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
