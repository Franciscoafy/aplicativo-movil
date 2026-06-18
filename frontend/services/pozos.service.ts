// Servicio para consumir la API de Pozos (TimescaleDB)
const API_BASE = "";



// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface PozoItem {
  entity_id: string;
  ultimo_registro: string | null;
  total_registros: number | null;
}

export interface PuntoTemporal {
  tiempo: string;  // ISO 8601
  valor: number | null;
}

export interface SerieTemporal {
  entity_id: string;
  variable: string;
  unidad: string;
  desde: string | null;
  hasta: string | null;
  intervalo: string;
  datos: PuntoTemporal[];
}

export interface ResumenPozo {
  entity_id: string;
  caudal_promedio: number | null;
  caudal_maximo: number | null;
  caudal_minimo: number | null;
  nivel_promedio: number | null;
  nivel_maximo: number | null;
  nivel_minimo: number | null;
  totalizador_ultimo: number | null;
  ultimo_registro: string | null;
  total_registros: number;
}

export type Intervalo = "5min" | "15min" | "1h" | "6h" | "1day";
export type Variable = "caudal" | "nivel" | "totalizador";

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildParams(params: Record<string, string | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") sp.append(k, v);
  }
  const str = sp.toString();
  return str ? `?${str}` : "";
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API error ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

// ── Funciones públicas ────────────────────────────────────────────────────────

/**
 * Lista todos los pozos únicos (entity_ids) con su último registro.
 */
export async function fetchPozos(): Promise<PozoItem[]> {
  return apiFetch<PozoItem[]>("/api/v1/pozos");
}

/**
 * Obtiene la serie temporal de CAUDAL (qc) para un pozo.
 */
export async function fetchCaudal(
  entityId: string,
  desde?: string,
  hasta?: string,
  intervalo: Intervalo = "1h"
): Promise<SerieTemporal> {
  const qs = buildParams({ desde, hasta, intervalo });
  return apiFetch<SerieTemporal>(`/api/v1/pozos/${entityId}/caudal${qs}`);
}

/**
 * Obtiene la serie temporal de NIVEL FREÁTICO (nc) para un pozo.
 */
export async function fetchNivel(
  entityId: string,
  desde?: string,
  hasta?: string,
  intervalo: Intervalo = "1h"
): Promise<SerieTemporal> {
  const qs = buildParams({ desde, hasta, intervalo });
  return apiFetch<SerieTemporal>(`/api/v1/pozos/${entityId}/nivel${qs}`);
}

/**
 * Obtiene la serie temporal del TOTALIZADOR (tc) para un pozo.
 */
export async function fetchTotalizador(
  entityId: string,
  desde?: string,
  hasta?: string,
  intervalo: Intervalo = "1h"
): Promise<SerieTemporal> {
  const qs = buildParams({ desde, hasta, intervalo });
  return apiFetch<SerieTemporal>(`/api/v1/pozos/${entityId}/totalizador${qs}`);
}

/**
 * Obtiene el resumen / KPIs de un pozo en un rango de fechas.
 */
export async function fetchResumenPozo(
  entityId: string,
  desde?: string,
  hasta?: string
): Promise<ResumenPozo> {
  const qs = buildParams({ desde, hasta });
  return apiFetch<ResumenPozo>(`/api/v1/pozos/${entityId}/resumen${qs}`);
}

/**
 * Carga en paralelo el caudal, nivel y resumen de un pozo.
 * Útil para cargar todos los datos del gráfico de una vez.
 */
export async function fetchDatosPozo(
  entityId: string,
  desde?: string,
  hasta?: string,
  intervalo: Intervalo = "1h"
): Promise<{
  caudal: SerieTemporal;
  nivel: SerieTemporal;
  resumen: ResumenPozo;
}> {
  const [caudal, nivel, resumen] = await Promise.all([
    fetchCaudal(entityId, desde, hasta, intervalo),
    fetchNivel(entityId, desde, hasta, intervalo),
    fetchResumenPozo(entityId, desde, hasta),
  ]);
  return { caudal, nivel, resumen };
}
