from app.models.order import Order
from app.models.address import Address
from app.repositories.shipment_repo import ShipmentRepository
from app.models.shipment import ShipmentStatus

class ShippingService:
    @staticmethod
    def calculate_shipping_cost(address: Address, order_subtotal: float) -> float:
        """
        Simple shipping logic:
        - Free shipping if order > 1000
        - Flat rate 50 otherwise
        - (Phase-4 extension: Check address.state/zip for dynamic rates)
        """
        if order_subtotal >= 1000:
            return 0.0
        return 50.0

    async def initialize_shipment(self, order_id: int, repo: ShipmentRepository):
        # Create a ready_to_ship record when order is confirmed
        await repo.create_shipment(order_id)
        
    async def update_shipment(self, id: int, courier: str, tracking: str, status: str, repo: ShipmentRepository):
        return await repo.update_tracking(id, courier, tracking, status)
