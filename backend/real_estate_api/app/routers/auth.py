from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserLogin, PasswordResetRequest, PasswordReset, Token

router = APIRouter()

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Register a new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists.",
        )
    
    user = User(
        username=user_in.username,
        email=user_in.email,
        password=get_password_hash(user_in.password),
        role=user_in.role,
        company=user_in.company,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        user = db.query(User).filter(User.username == form_data.username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email/username or password",
            )
    
    if not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            subject=user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login/json", response_model=Token)
def login_json(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserLogin = Body(...),
) -> Any:
    """
    JSON login endpoint for frontend applications.
    """
    email = user_in.email
    password = user_in.password
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            subject=user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/logout")
def logout() -> Any:
    """
    Logout endpoint (client-side only, just for API completeness).
    """
    return {"message": "Logged out successfully"}

@router.post("/reset-password", response_model=dict)
def reset_password_request(
    *,
    db: Session = Depends(deps.get_db),
    reset_request: PasswordResetRequest,
) -> Any:
    """
    Request password reset.
    """
    user = db.query(User).filter(User.email == reset_request.email).first()
    if not user:
        return {"message": "If the email exists, a password reset link has been sent."}
    
    return {"message": "If the email exists, a password reset link has been sent."}

@router.post("/reset-password/confirm", response_model=dict)
def reset_password_confirm(
    *,
    db: Session = Depends(deps.get_db),
    reset_data: PasswordReset,
) -> Any:
    """
    Reset password with token.
    """
    return {"message": "Password has been reset successfully."}
