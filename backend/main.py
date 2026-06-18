from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.pozos import router as pozos_router

app = FastAPI(
    title="API Telemetría Pozos DGA",
    description="Backend de telemetría para pozos de extracción — datos desde TimescaleDB.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Permite peticiones desde el frontend Next.js (localhost y red local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        "http://192.168.50.241:3000",
        "http://192.168.50.232:3000",
    ],
    allow_origin_regex="https?://.*",  # Permite cualquier origen de red local o desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(pozos_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "API Telemetría Pozos DGA"}
