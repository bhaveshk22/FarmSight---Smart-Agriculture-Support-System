# config.py
import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings."""

    # API settings
    API_TITLE: str = "FarmSight"
    API_DESCRIPTION: str = "Crop Yield Prediction"
    API_VERSION: str = "1.0.0"
     
    # MongoDB settings
    MONGODB_CONNECTION_STRING: str = os.environ.get("MONGODB_CONNECTION_STRING", "")
    # MONGODB_DATABASE_NAME: str = os.environ.get("MONGODB_DATABASE_NAME", "")
    
    # CORS settings
    ALLOW_ORIGINS: list = ["*"]  # Update for production
    ALLOW_CREDENTIALS: bool = True
    ALLOW_METHODS: list = ["*"]
    ALLOW_HEADERS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

