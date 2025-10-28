from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://gestion_user:gestion_123@localhost:5432/gestion_domains"
    
    # Security
    SECRET_KEY: str = "2026023d6f254e461935088e2d67ef8f68a03555b117f1545a3c6f0af397311b"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # App
    PROJECT_NAME: str = "Gestion Domains API"
    API_V1_STR: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
