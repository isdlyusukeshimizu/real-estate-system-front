from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)  # member/owner
    company = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    customers = relationship("Customer", back_populates="assigned_user")
    created_activities = relationship("Activity", back_populates="creator", foreign_keys="Activity.created_by")
    registry_data = relationship("RegistryData", back_populates="creator")
    billings = relationship("Billing", back_populates="user")
