from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone_number = Column(String, index=True)
    email = Column(String, index=True)
    current_address = Column(String)
    postal_code = Column(String, index=True)
    inheritance_address = Column(String)
    property_type = Column(String)
    status = Column(String)  # new/contacted/negotiating/contracted/closed/lost
    assigned_to = Column(Integer, ForeignKey("users.id"))
    last_contact_date = Column(Date, nullable=True)
    next_contact_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    source = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assigned_user = relationship("User", back_populates="customers")
    activities = relationship("Activity", back_populates="customer", cascade="all, delete-orphan")
