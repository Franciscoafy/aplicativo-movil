import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine

# Cargamos variables de entorno
load_dotenv()

# ── Motor principal (ThingsBoard / PostgreSQL) ───────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL no está configurada en las variables de entorno.")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

# ── Motor secundario (TimescaleDB / IoT Pozos) ───────────────────────────────
TIMESCALE_URL = os.getenv("TIMESCALE_URL")
if not TIMESCALE_URL:
    raise ValueError("TIMESCALE_URL no está configurada en las variables de entorno.")

timescale_engine = create_async_engine(
    TIMESCALE_URL,
    echo=False,
    future=True,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # verifica la conexión antes de usarla
)
