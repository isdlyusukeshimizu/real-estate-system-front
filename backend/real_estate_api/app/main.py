from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
try:
    import psycopg
except ImportError:
    pass

from app.core.config import settings
from app.core.middleware import RateLimitMiddleware, CSRFMiddleware
from app.api import deps
from app.routers import api_router
from app.db.init_db import init_db, init_sample_data
from app.db.session import SessionLocal

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.add_middleware(
    RateLimitMiddleware,
    rate_limit_per_minute=60,
    exclude_paths=["/healthz", "/docs", "/redoc"]
)

app.add_middleware(
    CSRFMiddleware,
    csrf_token_header="X-CSRF-Token",
    csrf_cookie_name="csrf_token",
    exclude_paths=["/api/v1/auth/login", "/api/v1/auth/login/json", "/api/v1/auth/register", "/healthz", "/docs", "/redoc"]
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/healthz")
async def healthz():
    """
    Health check endpoint for Render deployment.
    This endpoint is used by Render to verify the service is running.
    """
    return {"status": "ok", "service": settings.PROJECT_NAME}

@app.on_event("startup")
def startup_event():
    init_db()
    
    db = SessionLocal()
    try:
        from app.models.user import User
        user_count = db.query(User).count()
        if user_count == 0:
            init_sample_data(db)
    finally:
        db.close()
