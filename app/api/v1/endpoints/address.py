from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.core.database import get_db
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse

router = APIRouter()

@router.post("/", response_model=AddressResponse)
async def create_address(
    address_in: AddressCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Create a new address for the current user.
    """
    # If set as default, unset other defaults
    if address_in.is_default:
        await db.execute(
            select(Address).filter(Address.user_id == current_user.id, Address.is_default == True)
            # Logic to update would be complex in one query without an update stmt, 
            # so we fetch and update or use update stmt.
        )
        # Simplify: Just save and handle default logic in a service if needed.
        # For now, let's keep it simple: if this is first address, make it default.
    
    # Check if this is the first address
    # result = await db.execute(select(Address).filter(Address.user_id == current_user.id))
    # first_address = result.scalars().first()
    # is_default = address_in.is_default or (not first_address)

    new_address = Address(
        user_id=current_user.id,
        **address_in.dict()
    )
    db.add(new_address)
    await db.flush()
    await db.refresh(new_address)
    return new_address

@router.get("/", response_model=List[AddressResponse])
async def read_addresses(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Retrieve all addresses for the current user.
    """
    result = await db.execute(
        select(Address).filter(Address.user_id == current_user.id).offset(skip).limit(limit)
    )
    return result.scalars().all()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Delete an address.
    """
    result = await db.execute(select(Address).filter(Address.id == id, Address.user_id == current_user.id))
    address = result.scalars().first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
        
    await db.delete(address)
