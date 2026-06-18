from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional

from repositories.pozos_repository import PozosRepository
from schemas.pozos import PozoItem, SerieTemporal, PuntoTemporal, ResumenPozo

UNIDADES = {
    "caudal":      "m³/h",
    "nivel":       "m",
    "totalizador": "",
}


class PozosService:

    def __init__(self, db: AsyncSession):
        self.repo = PozosRepository(db)

    async def listar_pozos(self) -> list[PozoItem]:
        rows = await self.repo.listar_pozos()
        return [
            PozoItem(
                entity_id=r["entity_id"],
                ultimo_registro=r.get("ultimo_registro"),
                total_registros=r.get("total_registros"),
            )
            for r in rows
        ]

    async def serie_temporal(
        self,
        entity_id: str,
        variable: str,
        desde: Optional[datetime],
        hasta: Optional[datetime],
        intervalo: str = "1h",
    ) -> SerieTemporal:
        rows = await self.repo.serie_temporal(entity_id, variable, desde, hasta, intervalo)
        datos = [
            PuntoTemporal(
                tiempo=r["tiempo"],
                valor=round(float(r["valor"]), 4) if r.get("valor") is not None else None,
            )
            for r in rows
        ]
        return SerieTemporal(
            entity_id=entity_id,
            variable=variable,
            unidad=UNIDADES.get(variable, ""),
            desde=desde,
            hasta=hasta,
            intervalo=intervalo,
            datos=datos,
        )

    async def resumen_pozo(
        self,
        entity_id: str,
        desde: Optional[datetime],
        hasta: Optional[datetime],
    ) -> ResumenPozo:
        r = await self.repo.resumen_pozo(entity_id, desde, hasta)

        def _round(v) -> Optional[float]:
            return round(float(v), 4) if v is not None else None

        return ResumenPozo(
            entity_id=entity_id,
            caudal_promedio=_round(r.get("caudal_promedio")),
            caudal_maximo=_round(r.get("caudal_maximo")),
            caudal_minimo=_round(r.get("caudal_minimo")),
            nivel_promedio=_round(r.get("nivel_promedio")),
            nivel_maximo=_round(r.get("nivel_maximo")),
            nivel_minimo=_round(r.get("nivel_minimo")),
            totalizador_ultimo=_round(r.get("totalizador_ultimo")),
            ultimo_registro=r.get("ultimo_registro"),
            total_registros=r.get("total_registros", 0),
        )
