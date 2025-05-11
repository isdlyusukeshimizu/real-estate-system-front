from fastapi import APIRouter
from app.routers import auth, users, customers, external, analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(external.router, prefix="/external", tags=["external"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
