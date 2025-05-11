from sqlalchemy.orm import Session
from datetime import datetime, date
import os
from app.core.security import get_password_hash
from app.models.user import User
from app.models.customer import Customer
from app.models.activity import Activity
from app.models.registry_data import RegistryData
from app.models.billing import Billing
from app.db.session import Base, engine, is_sqlite

def init_db():
    Base.metadata.create_all(bind=engine)
    
def init_sample_data(db: Session):
    if not is_sqlite:
        print("Production environment detected, skipping sample data initialization")
        return
        
    user_count = db.query(User).count()
    if user_count > 0:
        print("Sample data already exists, skipping initialization")
        return
        
    owner = User(
        username="admin",
        email="admin@example.com",
        password=get_password_hash("password"),
        role="owner",
        company="Real Estate Company"
    )
    db.add(owner)
    
    member = User(
        username="member",
        email="member@example.com",
        password=get_password_hash("password"),
        role="member",
        company="Real Estate Company"
    )
    db.add(member)
    
    db.commit()
    
    customer1 = Customer(
        name="John Doe",
        phone_number="090-1234-5678",
        email="john@example.com",
        current_address="Tokyo, Shibuya-ku, 1-1-1",
        postal_code="150-0001",
        inheritance_address="Osaka, Chuo-ku, 2-2-2",
        property_type="Apartment",
        status="new",
        assigned_to=member.id,
        source="Website"
    )
    db.add(customer1)
    
    customer2 = Customer(
        name="Jane Smith",
        phone_number="080-9876-5432",
        email="jane@example.com",
        current_address="Kyoto, Nakagyo-ku, 3-3-3",
        postal_code="604-0001",
        inheritance_address="Fukuoka, Hakata-ku, 4-4-4",
        property_type="House",
        status="contacted",
        assigned_to=member.id,
        source="Referral"
    )
    db.add(customer2)
    
    db.commit()
    
    activity1 = Activity(
        customer_id=customer1.id,
        date=date(2025, 5, 1),
        type="call",
        description="Initial contact call",
        result="Customer interested in selling property",
        created_by=member.id
    )
    db.add(activity1)
    
    activity2 = Activity(
        customer_id=customer2.id,
        date=date(2025, 5, 5),
        type="meeting",
        description="In-person meeting at office",
        result="Discussed property valuation",
        created_by=member.id
    )
    db.add(activity2)
    
    registry1 = RegistryData(
        extracted_at=datetime(2025, 5, 2, 10, 0, 0),
        customer_name="John Doe",
        postal_code="150-0001",
        prefecture="Tokyo",
        current_address="Tokyo, Shibuya-ku, 1-1-1",
        inheritance_address="Osaka, Chuo-ku, 2-2-2",
        phone_number="090-1234-5678",
        status="registered",
        pdf_path="/uploads/registry1.pdf",
        created_by=member.id
    )
    db.add(registry1)
    
    billing1 = Billing(
        user_id=member.id,
        amount=50000,
        status="pending",
        due_date=date(2025, 6, 1),
        description="May 2025 service fee",
    )
    db.add(billing1)
    
    db.commit()
