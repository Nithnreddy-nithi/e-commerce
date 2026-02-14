from typing import Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.shipment import Shipment, ShipmentStatus

class ShipmentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_shipment(self, order_id: int) -> Shipment:
        shipment = Shipment(order_id=order_id, status=ShipmentStatus.READY_TO_SHIP)
        self.session.add(shipment)
        await self.session.flush()
        await self.session.refresh(shipment)
        return shipment

    async def update_tracking(self, shipment_id: int, courier: str, tracking_id: str, status: str) -> Optional[Shipment]:
        result = await self.session.execute(select(Shipment).filter(Shipment.id == shipment_id))
        shipment = result.scalars().first()
        
        if shipment:
            shipment.courier_name = courier
            shipment.tracking_id = tracking_id
            shipment.status = status
            await self.session.flush()
            await self.session.refresh(shipment)
            
        return shipment
