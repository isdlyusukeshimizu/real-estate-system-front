from pydantic_settings import BaseSettings
from typing import Optional, Dict, Any, List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Real Estate System API"
    
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://localhost:3000", 
        "http://127.0.0.1:3000", 
        "https://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://*.render.com",
        "https://*.railway.app"
    ]
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./real_estate.db")
    
    class Config:
        case_sensitive = True

settings = Settings()
