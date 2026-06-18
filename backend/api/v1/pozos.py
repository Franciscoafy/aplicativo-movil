from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional, Literal

from database.session import get_timescale_db
from services.pozos_service import PozosService
from schemas.pozos import PozoItem, SerieTemporal, ResumenPozo

router = APIRouter(tags=["Pozos"])

IntervalType = Literal["5min", "15min", "1h", "6h", "1day"]
VariableType = Literal["caudal", "nivel", "totalizador"]


@router.get("/pozos", response_model=list[PozoItem], summary="Listar pozos únicos")
async def listar_pozos(
    db: AsyncSession = Depends(get_timescale_db),
):
    """
    Devuelve los entity_ids únicos encontrados en telemetry_test,
    con la fecha de su último registro y el total de filas.
    """
    service = PozosService(db)
    return await service.listar_pozos()


@router.get(
    "/pozos/{entity_id}/caudal",
    response_model=SerieTemporal,
    summary="Serie temporal de caudal (qc)",
)
async def caudal(
    entity_id: str,
    desde: Optional[datetime] = Query(None, description="Fecha inicio (ISO 8601)"),
    hasta: Optional[datetime] = Query(None, description="Fecha fin (ISO 8601)"),
    intervalo: IntervalType = Query("1h", description="Agrupación temporal"),
    db: AsyncSession = Depends(get_timescale_db),
):
    """Serie temporal del caudal (columna `qc`) agrupada por intervalo."""
    service = PozosService(db)
    return await service.serie_temporal(entity_id, "caudal", desde, hasta, intervalo)


@router.get(
    "/pozos/{entity_id}/nivel",
    response_model=SerieTemporal,
    summary="Serie temporal de nivel freático (nc)",
)
async def nivel(
    entity_id: str,
    desde: Optional[datetime] = Query(None),
    hasta: Optional[datetime] = Query(None),
    intervalo: IntervalType = Query("1h"),
    db: AsyncSession = Depends(get_timescale_db),
):
    """Serie temporal del nivel freático (columna `nc`) agrupada por intervalo."""
    service = PozosService(db)
    return await service.serie_temporal(entity_id, "nivel", desde, hasta, intervalo)


@router.get(
    "/pozos/{entity_id}/totalizador",
    response_model=SerieTemporal,
    summary="Serie temporal del totalizador (tc)",
)
async def totalizador(
    entity_id: str,
    desde: Optional[datetime] = Query(None),
    hasta: Optional[datetime] = Query(None),
    intervalo: IntervalType = Query("1h"),
    db: AsyncSession = Depends(get_timescale_db),
):
    """Serie temporal del totalizador (columna `tc`) agrupada por intervalo."""
    service = PozosService(db)
    return await service.serie_temporal(entity_id, "totalizador", desde, hasta, intervalo)


@router.get(
    "/pozos/{entity_id}/serie",
    response_model=SerieTemporal,
    summary="Serie temporal genérica (cualquier variable)",
)
async def serie_generica(
    entity_id: str,
    variable: VariableType = Query("caudal", description="Variable a consultar"),
    desde: Optional[datetime] = Query(None),
    hasta: Optional[datetime] = Query(None),
    intervalo: IntervalType = Query("1h"),
    db: AsyncSession = Depends(get_timescale_db),
):
    """Endpoint flexible: elige la variable con el parámetro `variable`."""
    service = PozosService(db)
    return await service.serie_temporal(entity_id, variable, desde, hasta, intervalo)


@router.get(
    "/pozos/{entity_id}/resumen",
    response_model=ResumenPozo,
    summary="KPIs del pozo en un rango de fechas",
)
async def resumen(
    entity_id: str,
    desde: Optional[datetime] = Query(None),
    hasta: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_timescale_db),
):
    """Promedios, máximos, mínimos y último registro del pozo."""
    service = PozosService(db)
    result = await service.resumen_pozo(entity_id, desde, hasta)
    if result.total_registros == 0:
        raise HTTPException(status_code=404, detail=f"No se encontraron datos para entity_id={entity_id}")
    return result
