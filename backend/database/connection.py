import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine

# Cargamos variables de entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL no está configurada en las variables de entorno.")

# Creamos el motor asíncrono de SQLAlchemy para PostgreSQL
engine = create_async_engine(DATABASE_URL, echo=True, future=True)
