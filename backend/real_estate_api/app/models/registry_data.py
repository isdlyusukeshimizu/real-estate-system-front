from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class RegistryData(Base):
    __tablename__ = "registry_data"

    id = Column(Integer, primary_key=True, index=True)
    extracted_at = Column(DateTime(timezone=True), index=True)
    customer_name = Column(String, index=True)
    postal_code = Column(String, index=True)
    prefecture = Column(String, index=True)
    current_address = Column(String)
    inheritance_address = Column(String)
    phone_number = Column(String, index=True)
    status = Column(String, index=True)  # pending/registered/error
    pdf_path = Column(String)
    extracted_pdf_path = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="registry_data")
