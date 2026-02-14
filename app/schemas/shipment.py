from datetime import datetime
from pydantic import BaseModel

class ShipmentBase(BaseModel):
    courier_name: str | None = None
    tracking_id: str | None = None
    status: str | None = None

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentResponse(ShipmentBase):
    id: int
    order_id: int
    estimated_delivery: datetime | None = None
    
    class Config:
        from_attributes = True
