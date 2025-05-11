from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from datetime import date
import csv
from io import StringIO

from app.api import deps
from app.models.user import User
from app.models.customer import Customer
from app.models.activity import Activity
from app.schemas.customer import (
    Customer as CustomerSchema,
    CustomerCreate,
    CustomerUpdate,
    CustomerWithActivities,
    Activity as ActivitySchema,
    ActivityCreate,
    CustomerExport
)

router = APIRouter()

@router.get("/", response_model=List[CustomerSchema])
def get_customers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    assigned_to: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve customers with optional filtering.
    """
    query = db.query(Customer)
    
    if status:
        query = query.filter(Customer.status == status)
    
    if assigned_to:
        if current_user.role != "owner" and assigned_to != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Regular members can only filter by their own ID",
            )
        query = query.filter(Customer.assigned_to == assigned_to)
    elif current_user.role != "owner":
        query = query.filter(Customer.assigned_to == current_user.id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Customer.name.ilike(search_term)) |
            (Customer.email.ilike(search_term)) |
            (Customer.phone_number.ilike(search_term))
        )
    
    query = query.order_by(Customer.created_at.desc())
    
    customers = query.offset(skip).limit(limit).all()
    return customers

@router.post("/", response_model=CustomerSchema, status_code=status.HTTP_201_CREATED)
def create_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_in: CustomerCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new customer.
    """
    if not customer_in.assigned_to:
        customer_in.assigned_to = current_user.id
    
    if current_user.role != "owner" and customer_in.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Regular members can only create customers assigned to themselves",
        )
    
    customer = Customer(**customer_in.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{customer_id}", response_model=CustomerWithActivities)
def get_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int = Path(..., gt=0),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a specific customer by id with activities.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    
    if current_user.role != "owner" and customer.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this customer",
        )
    
    return customer

@router.put("/{customer_id}", response_model=CustomerSchema)
def update_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int = Path(..., gt=0),
    customer_in: CustomerUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a customer.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    
    if current_user.role != "owner" and customer.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this customer",
        )
    
    if (
        current_user.role != "owner" and 
        customer_in.assigned_to is not None and 
        customer_in.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Regular members cannot reassign customers to other users",
        )
    
    customer_data = customer_in.model_dump(exclude_unset=True)
    for field in customer_data:
        setattr(customer, field, customer_data[field])
    
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{customer_id}", response_model=CustomerSchema)
def delete_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int = Path(..., gt=0),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a customer.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    
    if current_user.role != "owner" and customer.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this customer",
        )
    
    db.delete(customer)
    db.commit()
    return customer

@router.get("/{customer_id}/activities", response_model=List[ActivitySchema])
def get_customer_activities(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int = Path(..., gt=0),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get activities for a specific customer.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    
    if current_user.role != "owner" and customer.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this customer's activities",
        )
    
    activities = (
        db.query(Activity)
        .filter(Activity.customer_id == customer_id)
        .order_by(Activity.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return activities

@router.post("/{customer_id}/activities", response_model=ActivitySchema, status_code=status.HTTP_201_CREATED)
def create_customer_activity(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int = Path(..., gt=0),
    activity_in: ActivityCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new activity for a customer.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    
    if current_user.role != "owner" and customer.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to add activities to this customer",
        )
    
    if activity_in.customer_id != customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer ID in path must match customer ID in request body",
        )
    
    activity = Activity(
        **activity_in.model_dump(),
        created_by=current_user.id
    )
    db.add(activity)
    
    customer.last_contact_date = activity_in.date
    db.add(customer)
    
    db.commit()
    db.refresh(activity)
    return activity

@router.get("/export", response_model=CustomerExport)
def export_customers(
    db: Session = Depends(deps.get_db),
    status: Optional[str] = None,
    assigned_to: Optional[int] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Export customers as CSV.
    """
    query = db.query(Customer)
    
    if status:
        query = query.filter(Customer.status == status)
    
    if assigned_to:
        if current_user.role != "owner" and assigned_to != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Regular members can only filter by their own ID",
            )
        query = query.filter(Customer.assigned_to == assigned_to)
    elif current_user.role != "owner":
        query = query.filter(Customer.assigned_to == current_user.id)
    
    query = query.order_by(Customer.created_at.desc())
    
    customers = query.all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "ID", "Name", "Phone Number", "Email", "Current Address", "Postal Code",
        "Inheritance Address", "Property Type", "Status", "Assigned To",
        "Last Contact Date", "Next Contact Date", "Notes", "Source",
        "Created At", "Updated At"
    ])
    
    for customer in customers:
        writer.writerow([
            customer.id, customer.name, customer.phone_number, customer.email,
            customer.current_address, customer.postal_code, customer.inheritance_address,
            customer.property_type, customer.status, customer.assigned_to,
            customer.last_contact_date, customer.next_contact_date, customer.notes,
            customer.source, customer.created_at, customer.updated_at
        ])
    
    return {
        "data": customers,
        "filename": f"customers_export_{date.today().isoformat()}.csv"
    }
