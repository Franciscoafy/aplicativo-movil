from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PozoItem(BaseModel):
    """Un pozo único identificado por su entity_id."""
    entity_id: str
    ultimo_registro: Optional[datetime] = None
    total_registros: Optional[int] = None


class PuntoTemporal(BaseModel):
    """Un punto de dato en el tiempo."""
    tiempo: datetime
    valor: Optional[float] = None


class SerieTemporal(BaseModel):
    """Respuesta de serie temporal para un pozo."""
    entity_id: str
    variable: str          # "caudal", "nivel", "totalizador"
    unidad: str            # "m3/h", "m", ""
    desde: Optional[datetime] = None
    hasta: Optional[datetime] = None
    intervalo: str         # "5min", "1h", "1day"
    datos: list[PuntoTemporal]


class ResumenPozo(BaseModel):
    """KPIs / resumen del pozo en un rango de fechas."""
    entity_id: str
    caudal_promedio: Optional[float] = None
    caudal_maximo: Optional[float] = None
    caudal_minimo: Optional[float] = None
    nivel_promedio: Optional[float] = None
    nivel_maximo: Optional[float] = None
    nivel_minimo: Optional[float] = None
    totalizador_ultimo: Optional[float] = None
    ultimo_registro: Optional[datetime] = None
    total_registros: int = 0
