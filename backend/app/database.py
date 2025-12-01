from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# IMPORTANT: use asyncpg for async SQLAlchemy
DATABASE_URL = "postgresql+asyncpg://postgres:root@localhost:5432/postgres"

# Base class for models
Base = declarative_base()

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True
)

# Create session factory
SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency for FastAPI
async def get_db():
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()
