from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from database.connection import engine
from typing import AsyncGenerator

# Creador de sesiones asíncronas
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Dependencia para obtener la sesión de BD en los endpoints
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
