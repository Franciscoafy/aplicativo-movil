from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime
from typing import Optional

# Mapeo de variable → columna real en telemetry_test
COLUMN_MAP = {
    "caudal":      "qc",
    "nivel":       "nc",
    "totalizador": "tc",
}

# Mapeo de intervalo legible → time_bucket de TimescaleDB
INTERVAL_MAP = {
    "5min": "5 minutes",
    "15min": "15 minutes",
    "1h":   "1 hour",
    "6h":   "6 hours",
    "1day": "1 day",
}


class PozosRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def listar_pozos(self) -> list[dict]:
        """Devuelve los entity_ids únicos con su último registro y total de filas."""
        query = text("""
            SELECT
                entity_id::text,
                MAX(dt)             AS ultimo_registro,
                COUNT(*)            AS total_registros
            FROM public.telemetry_test
            GROUP BY entity_id
            ORDER BY ultimo_registro DESC
        """)
        result = await self.db.execute(query)
        rows = result.mappings().all()
        return [dict(r) for r in rows]

    async def serie_temporal(
        self,
        entity_id: str,
        variable: str,          # "caudal" | "nivel" | "totalizador"
        desde: Optional[datetime],
        hasta: Optional[datetime],
        intervalo: str = "1h",
    ) -> list[dict]:
        """
        Devuelve una serie temporal agregada con time_bucket de TimescaleDB.
        Usa AVG para caudal/nivel y MAX para totalizador.
        """
        col = COLUMN_MAP.get(variable, "qc")
        bucket = INTERVAL_MAP.get(intervalo, "1 hour")

        # El totalizador es acumulativo → usamos MAX; los demás → AVG
        agg_fn = "MAX" if variable == "totalizador" else "AVG"

        params: dict = {"entity_id": entity_id}
        where_clauses = ["entity_id = :entity_id"]

        if desde:
            where_clauses.append("dt >= :desde")
            params["desde"] = desde
        if hasta:
            where_clauses.append("dt <= :hasta")
            params["hasta"] = hasta

        where_sql = " AND ".join(where_clauses)

        # NOTA: bucket se interpola directamente (seguro: viene de INTERVAL_MAP controlado)
        # asyncpg no soporta ::interval cast sobre parámetros nombrados
        query = text(f"""
            SELECT
                time_bucket('{bucket}'::interval, dt) AS tiempo,
                {agg_fn}({col})                       AS valor
            FROM public.telemetry_test
            WHERE {where_sql}
              AND {col} IS NOT NULL
            GROUP BY tiempo
            ORDER BY tiempo ASC
        """)
        result = await self.db.execute(query, params)
        rows = result.mappings().all()
        return [dict(r) for r in rows]


    async def resumen_pozo(
        self,
        entity_id: str,
        desde: Optional[datetime],
        hasta: Optional[datetime],
    ) -> dict:
        """Calcula KPIs del pozo en el rango de fechas dado."""
        params: dict = {"entity_id": entity_id}
        where_clauses = ["entity_id = :entity_id"]

        if desde:
            where_clauses.append("dt >= :desde")
            params["desde"] = desde
        if hasta:
            where_clauses.append("dt <= :hasta")
            params["hasta"] = hasta

        where_sql = " AND ".join(where_clauses)

        query = text(f"""
            SELECT
                AVG(qc)    AS caudal_promedio,
                MAX(qc)    AS caudal_maximo,
                MIN(qc)    AS caudal_minimo,
                AVG(nc)    AS nivel_promedio,
                MAX(nc)    AS nivel_maximo,
                MIN(nc)    AS nivel_minimo,
                MAX(tc)    AS totalizador_ultimo,
                MAX(dt)    AS ultimo_registro,
                COUNT(*)   AS total_registros
            FROM public.telemetry_test
            WHERE {where_sql}
        """)
        result = await self.db.execute(query, params)
        row = result.mappings().first()
        return dict(row) if row else {}
