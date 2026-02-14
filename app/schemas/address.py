from typing import Optional
from pydantic import BaseModel

class AddressBase(BaseModel):
    full_name: str
    phone_number: str
    start_line: str
    city: str
    state: str
    zip_code: str
    country: str = "India"
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(AddressBase):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    start_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    is_default: Optional[bool] = None

class AddressResponse(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
