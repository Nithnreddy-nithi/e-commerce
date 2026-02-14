from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.core.database import get_db
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.services.shipping_service import ShippingService
from app.repositories.shipment_repo import ShipmentRepository
from app.models.shipment import ShipmentStatus

from pydantic import BaseModel

class ShipmentUpdate(BaseModel):
    courier_name: str
    tracking_id: str
    status: str

class ShipmentResponse(BaseModel):
    id: int
    order_id: int
    courier_name: str | None
    tracking_id: str | None
    status: str
    
    class Config:
        from_attributes = True

router = APIRouter()

@router.put("/shipments/{shipment_id}", response_model=ShipmentResponse)
async def update_shipment_status(
    shipment_id: int,
    update_data: ShipmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser)  # Admin only
):
    """
    Admin: Update shipment tracking and status.
    Also syncs the parent order status accordingly.
    """
    repo = ShipmentRepository(db)
    service = ShippingService()
    
    shipment = await service.update_shipment(
        shipment_id, 
        update_data.courier_name, 
        update_data.tracking_id, 
        update_data.status,
        repo
    )
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    # Sync order status based on shipment status
    result = await db.execute(select(Order).filter(Order.id == shipment.order_id))
    order = result.scalars().first()
    if order:
        if update_data.status in (ShipmentStatus.SHIPPED, ShipmentStatus.IN_TRANSIT):
            order.status = OrderStatus.SHIPPED
        elif update_data.status == ShipmentStatus.DELIVERED:
            order.status = OrderStatus.DELIVERED
        db.add(order)
        await db.flush()
        
    return shipment

@router.get("/shipments/order/{order_id}", response_model=ShipmentResponse)
async def get_order_shipment(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get shipment details for an order.
    """
    # Verify user owns the order
    result = await db.execute(select(Order).filter(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    repo = ShipmentRepository(db)
    from sqlalchemy.future import select as sel
    from app.models.shipment import Shipment
    res = await db.execute(sel(Shipment).filter(Shipment.order_id == order_id))
    shipment = res.scalars().first()
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found for this order")
    
    return shipment
