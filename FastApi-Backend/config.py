from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_TITLE: str = "FarmSight"
    API_DESCRIPTION: str = "Crop Yield Prediction"
    API_VERSION: str = "1.0.0"

    MONGODB_CONNECTION_STRING: str 
    MODEL: str
    DATASET: str

    ALLOW_ORIGINS: list[str] = ["*"]
    ALLOW_CREDENTIALS: bool = True
    ALLOW_METHODS: list[str] = ["*"]
    ALLOW_HEADERS: list[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
