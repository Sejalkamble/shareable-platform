# backend/app/config.py
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql+asyncpg://postgres:root@localhost:5432/postgres")
    SECRET_KEY: str = Field(default="secretkey")
    DEBUG: bool = Field(default=True)

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

