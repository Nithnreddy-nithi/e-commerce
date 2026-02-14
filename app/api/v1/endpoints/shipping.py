from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.core.database import get_db
from app.models.user import User
from app.services.shipping_service import ShippingService
from app.repositories.shipment_repo import ShipmentRepository
from app.schemas.address import AddressResponse # Just for reference

# Schema for Shipment Update (Mocking schema creation here for simplicity or should be in schemas/shipment.py)
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
    current_user: User = Depends(deps.get_current_active_superuser) # Admin only
):
    """
    Admin: Update shipment tracking and status.
    """
    repo = ShipmentRepository(db)
    service = ShippingService()
    
    # Check if shipment exists
    # We rely on repo update to return None if not found, or strict check.
    # Repo logic:
    shipment = await service.update_shipment(
        shipment_id, 
        update_data.courier_name, 
        update_data.tracking_id, 
        update_data.status,
        repo
    )
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    return shipment
