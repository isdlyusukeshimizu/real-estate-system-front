from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime, date

class CustomerBase(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    current_address: Optional[str] = None
    postal_code: Optional[str] = None
    inheritance_address: Optional[str] = None
    property_type: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    last_contact_date: Optional[date] = None
    next_contact_date: Optional[date] = None
    notes: Optional[str] = None
    source: Optional[str] = None

class CustomerCreate(CustomerBase):
    name: str
    phone_number: str
    status: str = "new"  # Default status is new

class CustomerUpdate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ActivityBase(BaseModel):
    customer_id: Optional[int] = None
    date: Optional[date] = None
    type: Optional[str] = None
    description: Optional[str] = None
    result: Optional[str] = None

class ActivityCreate(ActivityBase):
    customer_id: int
    date: date
    type: str
    description: str

class Activity(ActivityBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CustomerWithActivities(Customer):
    activities: List[Activity] = []

    class Config:
        from_attributes = True

class CustomerExport(BaseModel):
    data: List[Customer]
    filename: str
