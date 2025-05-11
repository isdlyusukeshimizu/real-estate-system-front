from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None

class UserCreate(UserBase):
    username: str
    email: EmailStr
    password: str
    role: str = "member"  # Default role is member

class UserUpdate(UserBase):
    password: Optional[str] = None
    role: Optional[str] = None

class User(UserBase):
    id: int
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@example.com",
                "password": "password"
            }
        }

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
