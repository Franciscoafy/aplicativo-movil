from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from database.connection import engine, timescale_engine
from typing import AsyncGenerator

# ── Sesión BD principal (ThingsBoard) ────────────────────────────────────────
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

# ── Sesión TimescaleDB (Pozos / IoT) ─────────────────────────────────────────
timescale_session = async_sessionmaker(
    bind=timescale_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_timescale_db() -> AsyncGenerator[AsyncSession, None]:
    async with timescale_session() as session:
        try:
            yield session
        finally:
            await session.close()
