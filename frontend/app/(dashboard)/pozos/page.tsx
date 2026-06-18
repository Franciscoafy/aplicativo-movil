"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { 
  Calendar, 
  RefreshCw, 
  ChevronDown, 
  BarChart3, 
  Droplet, 
  Info,
  Clock,
  Maximize2,
  X,
  Loader2
} from "lucide-react";
import {
  fetchPozos,
  fetchDatosPozo,
  PozoItem,
  ResumenPozo,
  SerieTemporal,
  Intervalo,
} from "@/services/pozos.service";

const ProbeIcon = () => (
  <svg className="w-5 h-5 text-[#00d4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4v16M12 4v16M16 4v16M8 9h8M8 15h8" />
  </svg>
);

// Calcula el intervalo óptimo según el rango de fechas
function getAutoInterval(startDate: string, endDate: string): Intervalo {
  const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= 1)  return "15min";
  if (diffDays <= 7)  return "1h";
  if (diffDays <= 30) return "6h";
  return "1day";
}

// Abrevia un UUID para mostrarlo en el selector
function shortId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}

// Formatea una fecha ISO a label legible
function formatTime(isoString: string, diffDays: number): { label: string; fullLabel: string } {
  const d = new Date(isoString);
  if (diffDays <= 1) {
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return {
      label: `${hh}:${mm}`,
      fullLabel: `${d.toLocaleDateString("es-CL")} ${hh}:${mm}`,
    };
  }
  const dd = d.getDate().toString().padStart(2, "0");
  const mo = (d.getMonth() + 1).toString().padStart(2, "0");
  return {
    label: `${dd}/${mo}`,
    fullLabel: d.toLocaleDateString("es-CL"),
  };
}

export default function PozosPage() {
  // ── Estado de selección ────────────────────────────────────────────────────
  const [selectedWell, setSelectedWell] = useState<string>("Todos");

  // ── Rango de fechas ────────────────────────────────────────────────────────
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(weekAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [preset, setPreset] = useState("Última semana");

  const [tempStartDate, setTempStartDate] = useState(weekAgoStr);
  const [tempEndDate, setTempEndDate] = useState(todayStr);
  const [tempPreset, setTempPreset] = useState("Última semana");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenDatePickerOpen, setIsFullscreenDatePickerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const fullscreenPopoverRef = useRef<HTMLDivElement>(null);

  // ── Estado de API ──────────────────────────────────────────────────────────
  const [wells, setWells] = useState<PozoItem[]>([]);
  const [wellsLoading, setWellsLoading] = useState(true);
  const [resumen, setResumen] = useState<ResumenPozo | null>(null);
  const [caudalSerie, setCaudalSerie] = useState<SerieTemporal | null>(null);
  const [nivelSerie, setNivelSerie] = useState<SerieTemporal | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  // ── Cargar lista de pozos al inicio ───────────────────────────────────────
  useEffect(() => {
    setWellsLoading(true);
    fetchPozos()
      .then((data) => {
        setWells(data);
        // Seleccionar el primer pozo automáticamente
        if (data.length > 0) {
          setSelectedWell(data[0].entity_id);
        }
      })
      .catch(console.error)
      .finally(() => setWellsLoading(false));
  }, []);

  // ── Cargar datos del gráfico y KPIs cuando cambia el pozo o las fechas ────
  const loadChartData = useCallback(async () => {
    if (selectedWell === "Todos" || !selectedWell) return;
    setChartLoading(true);
    setChartError(null);
    try {
      const intervalo = getAutoInterval(startDate, endDate);
      const desde = `${startDate}T00:00:00`;
      const hasta = `${endDate}T23:59:59`;
      const { caudal, nivel, resumen: res } = await fetchDatosPozo(
        selectedWell,
        desde,
        hasta,
        intervalo
      );
      setCaudalSerie(caudal);
      setNivelSerie(nivel);
      setResumen(res);
    } catch (err) {
      setChartError("Error al cargar datos del pozo");
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  }, [selectedWell, startDate, endDate]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  // ── Popover fuera del área ─────────────────────────────────────────────────
  useEffect(() => {
    function h(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node))
        setIsDatePickerOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (fullscreenPopoverRef.current && !fullscreenPopoverRef.current.contains(e.target as Node))
        setIsFullscreenDatePickerOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (isFullscreen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isFullscreen]);

  // ── Presets de fechas ──────────────────────────────────────────────────────
  const handlePresetClick = (selectedPreset: string) => {
    setTempPreset(selectedPreset);
    const now = new Date();
    const end = new Date(now);
    const start = new Date(now);
    if (selectedPreset === "Últimas 24 horas") {
      start.setDate(start.getDate() - 1);
    } else if (selectedPreset === "Última semana") {
      start.setDate(start.getDate() - 7);
    } else if (selectedPreset === "Último mes") {
      start.setMonth(start.getMonth() - 1);
    } else if (selectedPreset === "Últimos 6 meses") {
      start.setMonth(start.getMonth() - 6);
    } else if (selectedPreset === "Último año") {
      start.setFullYear(start.getFullYear() - 1);
    }
    setTempStartDate(start.toISOString().split("T")[0]);
    setTempEndDate(end.toISOString().split("T")[0]);
  };

  const applyCustomRange = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPreset(tempPreset);
    setIsDatePickerOpen(false);
    setIsFullscreenDatePickerOpen(false);
  };

  const handleUpdate = () => {
    setUpdating(true);
    loadChartData().finally(() => setUpdating(false));
  };

  // ── Datos del gráfico de líneas (fusión caudal + nivel) ───────────────────
  const diffDays = useMemo(() => {
    const d = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(d, 0);
  }, [startDate, endDate]);

  const lineChartData = useMemo(() => {
    if (!caudalSerie || !nivelSerie) return [];

    // Construimos un mapa de timestamp → { caudal, nivel }
    const map = new Map<string, { caudal: number | null; nivel: number | null }>();

    caudalSerie.datos.forEach((p) => {
      if (p.tiempo) map.set(p.tiempo, { caudal: p.valor, nivel: null });
    });
    nivelSerie.datos.forEach((p) => {
      if (p.tiempo) {
        const existing = map.get(p.tiempo) ?? { caudal: null, nivel: null };
        map.set(p.tiempo, { ...existing, nivel: p.valor });
      }
    });

    const sorted = Array.from(map.entries()).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );

    return sorted.map(([tiempo, vals]) => {
      const { label, fullLabel } = formatTime(tiempo, diffDays);
      return {
        label,
        fullLabel,
        caudal: vals.caudal ?? 0,
        nivel: vals.nivel ?? 0,
        totalizador: resumen?.totalizador_ultimo ?? 0,
      };
    });
  }, [caudalSerie, nivelSerie, resumen, diffDays]);

  // ── KPI cards (desde resumen API) ─────────────────────────────────────────
  const fmtNum = (v: number | null | undefined, dec = 1) =>
    v != null ? v.toLocaleString("es-CL", { minimumFractionDigits: dec, maximumFractionDigits: dec }) : "--";

  // ── Dimensiones SVG ───────────────────────────────────────────────────────
  const width = 450;
  const height = isFullscreen ? 340 : 220;
  const padding = { top: 20, right: 45, bottom: 30, left: 45 };

  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [lineTooltipPos, setLineTooltipPos] = useState({ x: 0, y: 0 });

  const lineChartCoords = useMemo(() => {
    if (lineChartData.length < 2) return null;
    const caudals = lineChartData.map((c) => c.caudal);
    const nivels = lineChartData.map((c) => c.nivel);

    const minC = Math.min(...caudals);
    const maxC = Math.max(...caudals) || 1;
    const minN = Math.min(...nivels);
    const maxN = Math.max(...nivels) || 1;

    const getXCoord = (i: number) => {
      const cw = width - padding.left - padding.right;
      return padding.left + (i / (lineChartData.length - 1)) * cw;
    };
    const getCaudalY = (v: number) => {
      const s = maxC === minC ? 0.5 : (v - minC) / (maxC - minC);
      return height - padding.bottom - s * (height - padding.top - padding.bottom - 40) - 20;
    };
    const getNivelY = (v: number) => {
      const s = maxN === minN ? 0.5 : (v - minN) / (maxN - minN);
      return height - padding.bottom - s * (height - padding.top - padding.bottom - 40) - 20;
    };

    let caudalPath = `M ${getXCoord(0)} ${getCaudalY(lineChartData[0].caudal)}`;
    let nivelPath = `M ${getXCoord(0)} ${getNivelY(lineChartData[0].nivel)}`;
    for (let i = 1; i < lineChartData.length; i++) {
      caudalPath += ` L ${getXCoord(i)} ${getCaudalY(lineChartData[i].caudal)}`;
      nivelPath += ` L ${getXCoord(i)} ${getNivelY(lineChartData[i].nivel)}`;
    }

    return { getXCoord, getCaudalY, getNivelY, caudalPath, nivelPath, minC, maxC, minN, maxN };
  }, [lineChartData, height]);

  const handleLineInteraction = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    e.stopPropagation();
    if (lineChartData.length < 2) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      if (e.type === "touchmove" && e.cancelable) e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const svgX = ((clientX - rect.left) / rect.width) * width;
    const svgY = ((clientY - rect.top) / rect.height) * height;
    const cw = width - padding.left - padding.right;
    const pct = (svgX - padding.left) / cw;
    const idx = Math.min(lineChartData.length - 1, Math.max(0, Math.round(pct * (lineChartData.length - 1))));
    setHoveredLineIndex(idx);
    setLineTooltipPos({ x: svgX, y: svgY });
  };

  // ── Datos mock para barras (semanal/mensual/anual — próximamente API) ──────
  const weeklyData = useMemo(() => {
    const end = new Date(endDate);
    return Array.from({ length: 5 }, (_, i) => {
      const wEnd = new Date(end); wEnd.setDate(end.getDate() - i * 7);
      const wStart = new Date(wEnd); wStart.setDate(wEnd.getDate() - 6);
      const fmt = (d: Date) => `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}`;
      return { label: `S${5 - i}`, dateRange: `${fmt(wStart)} - ${fmt(wEnd)}`, val: parseFloat((84.2 * (0.85 + Math.sin(i * 1.3) * 0.12)).toFixed(1)) };
    }).reverse();
  }, [endDate]);

  const weeklyCoords = useMemo(() =>
    weeklyData.map((item, idx) => {
      const maxVal = 150;
      const barHeight = Math.min(110, (item.val / maxVal) * 110) || 0;
      const x = 50 + idx * 75;
      return { x, y: 130 - barHeight, barHeight };
    }), [weeklyData]);

  const [selectedWeeklyIndex, setSelectedWeeklyIndex] = useState<number | null>(4);

  const monthlyData = useMemo(() =>
    ["ENE","FEB","MAR","ABR","MAY","JUN"].map((m, idx) => ({
      month: m, fullMonth: `${m} 2026`, val: [342,310,365,390,420,480][idx]
    })), []);

  const monthlyCoords = useMemo(() =>
    monthlyData.map((item, idx) => {
      const barHeight = (item.val / 600) * 110;
      const x = 45 + idx * 65;
      return { x, y: 130 - barHeight, barHeight };
    }), [monthlyData]);

  const [selectedMonthlyIndex, setSelectedMonthlyIndex] = useState<number | null>(5);

  const anualData = useMemo(() =>
    ["2022","2023","2024","2025","2026"].map((y, idx) => ({
      year: y, fullYear: `Año ${y}`, val: [48000,52000,56000,61000,68000][idx]
    })), []);

  const anualCoords = useMemo(() =>
    anualData.map((item, idx) => {
      const barHeight = (item.val / 80000) * 110;
      const x = 50 + idx * 75;
      return { x, y: 130 - barHeight, barHeight };
    }), [anualData]);

  const [selectedAnualIndex, setSelectedAnualIndex] = useState<number | null>(4);

  // ── Texto del rango ────────────────────────────────────────────────────────
  const displayRangeText = useMemo(() => {
    const fmt = (s: string) => { const p = s.split("-"); return `${p[2]}/${p[1]}/${p[0]}`; };
    if (preset === "Personalizado") return `${fmt(startDate)} - ${fmt(endDate)}`;
    return `${preset} (${fmt(startDate)} - ${fmt(endDate)})`;
  }, [startDate, endDate, preset]);

  // ── Nombre legible del pozo seleccionado ──────────────────────────────────
  const selectedWellLabel = useMemo(() => {
    if (selectedWell === "Todos") return "Todos los Pozos";
    return `Pozo ${shortId(selectedWell)}`;
  }, [selectedWell]);

  // ── Render de Skeleton para loading ───────────────────────────────────────
  const CardSkeleton = () => (
    <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30 animate-pulse">
      <div className="h-7 w-20 bg-[#3c494e]/40 rounded mb-2" />
      <div className="h-2 w-16 bg-[#3c494e]/30 rounded" />
    </div>
  );

  // ── Componente inline del gráfico SVG ─────────────────────────────────────
  const renderLineChart = () => {
    if (chartLoading) {
      return (
        <div className="w-full flex items-center justify-center py-14">
          <Loader2 className="w-7 h-7 text-[#00d4ff] animate-spin" />
          <span className="ml-2 text-xs text-[#859398]">Cargando datos...</span>
        </div>
      );
    }
    if (chartError) {
      return (
        <div className="w-full flex items-center justify-center py-10 text-center">
          <span className="text-[10px] text-red-400">{chartError}</span>
        </div>
      );
    }
    if (selectedWell === "Todos" || !lineChartCoords || lineChartData.length < 2) {
      return (
        <div className="w-full flex flex-col items-center justify-center py-10 text-center gap-2">
          <ProbeIcon />
          <span className="text-[10px] text-[#859398]">Selecciona un pozo para ver su gráfico</span>
        </div>
      );
    }

    return (
      <div className="w-full mt-2 relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none cursor-crosshair"
          onMouseMove={handleLineInteraction}
          onTouchStart={handleLineInteraction}
          onTouchMove={handleLineInteraction}
          onClick={(e) => {
            e.stopPropagation();
            setHoveredLineIndex(null);
          }}
          onMouseLeave={() => setHoveredLineIndex(null)}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid */}
          {[20, 95, 170].map((y) => (
            <line key={y} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#3c494e" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15" />
          ))}

          {/* Ejes */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#3c494e" strokeWidth="1" opacity="0.6" />
          <line x1={width - padding.right} y1={padding.top} x2={width - padding.right} y2={height - padding.bottom} stroke="#3c494e" strokeWidth="1" opacity="0.6" />
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#3c494e" strokeWidth="1" opacity="0.6" />

          {/* Ticks izquierda (Caudal) */}
          <text x={padding.left - 6} y={23} fill="#00d4ff" fontSize="7" textAnchor="end" fontFamily="monospace" fontWeight="bold">{fmtNum(lineChartCoords.maxC)} m³/h</text>
          <text x={padding.left - 6} y={98} fill="#00d4ff" fontSize="7" textAnchor="end" fontFamily="monospace">{fmtNum((lineChartCoords.maxC + lineChartCoords.minC) / 2)}</text>
          <text x={padding.left - 6} y={173} fill="#00d4ff" fontSize="7" textAnchor="end" fontFamily="monospace">{fmtNum(lineChartCoords.minC)}</text>

          {/* Ticks derecha (Nivel) */}
          <text x={width - padding.right + 6} y={23} fill="#ffcd56" fontSize="7" textAnchor="start" fontFamily="monospace" fontWeight="bold">{fmtNum(lineChartCoords.maxN)} m</text>
          <text x={width - padding.right + 6} y={98} fill="#ffcd56" fontSize="7" textAnchor="start" fontFamily="monospace">{fmtNum((lineChartCoords.maxN + lineChartCoords.minN) / 2)}</text>
          <text x={width - padding.right + 6} y={173} fill="#ffcd56" fontSize="7" textAnchor="start" fontFamily="monospace">{fmtNum(lineChartCoords.minN)}</text>

          {/* Eje X: fechas */}
          {lineChartData.map((item, idx) => {
            const show = lineChartData.length > 24 ? idx % 6 === 0 : lineChartData.length > 12 ? idx % 4 === 0 : lineChartData.length > 8 ? idx % 2 === 0 : true;
            if (!show) return null;
            return (
              <text key={idx} x={lineChartCoords.getXCoord(idx)} y={height - padding.bottom + 14} fill="#859398" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                {item.label}
              </text>
            );
          })}

          {/* Paths */}
          <path d={lineChartCoords.caudalPath} fill="none" stroke="#00d4ff" strokeWidth="2.2" strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(0,212,255,0.4)]" />
          <path d={lineChartCoords.nivelPath} fill="none" stroke="#ffcd56" strokeWidth="2.2" strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(255,205,86,0.4)]" />

          {/* Línea de guía */}
          {hoveredLineIndex !== null && (
            <line x1={lineChartCoords.getXCoord(hoveredLineIndex)} y1={padding.top} x2={lineChartCoords.getXCoord(hoveredLineIndex)} y2={height - padding.bottom} stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
          )}
        </svg>

        {/* Tooltip */}
        {hoveredLineIndex !== null && lineChartData[hoveredLineIndex] && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bg-[#0c162d]/95 border border-[#00d4ff]/40 rounded-xl p-3 shadow-2xl text-[9px] pointer-events-none z-50 w-[170px]"
            style={{ left: `${(lineTooltipPos.x / 450) * 100}%`, top: `${((lineTooltipPos.y - 15) / height) * 100}%`, transform: "translate(-50%, -100%)" }}
          >
            <span className="font-bold text-[#859398] border-b border-[#3c494e]/30 pb-1 mb-1 block">{lineChartData[hoveredLineIndex].fullLabel}</span>
            <div className="flex justify-between"><span className="text-[#ffcd56]">Nivel:</span><span className="font-bold">{fmtNum(lineChartData[hoveredLineIndex].nivel)} m</span></div>
            <div className="flex justify-between"><span className="text-[#00d4ff]">Caudal:</span><span className="font-bold">{fmtNum(lineChartData[hoveredLineIndex].caudal)} m³/h</span></div>
          </div>
        )}
      </div>
    );
  };

  // ── Leyenda del gráfico ────────────────────────────────────────────────────
  const ChartLegend = () => (
    <div className="flex gap-4 text-[8px] text-[#859398] font-mono mt-1">
      <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-[#00d4ff] inline-block" />Caudal (m³/h)</span>
      <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-[#ffcd56] inline-block" />Nivel freático (m)</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 font-mono max-w-md mx-auto bg-[#0b1326] text-white pb-6 relative">

      {/* 1. FILTROS DE CABECERA */}
      <div className="sticky top-0 bg-[#0b1326]/95 backdrop-blur-md z-40 py-3 px-2 border-b border-[#3c494e]/20 flex flex-col gap-2.5 shadow-lg">

        {/* Rango de Fechas */}
        <div className="flex flex-col gap-1 px-1" ref={popoverRef}>
          <label className="text-[9px] font-bold text-[#859398] tracking-widest uppercase">Rango Global de Tiempo</label>
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full pl-3.5 pr-10 py-2.5 bg-[#060e20]/60 border border-[#3c494e]/30 text-xs rounded-xl text-left font-bold text-[#dae2fd] flex items-center justify-between outline-none"
            >
              <span className="truncate">{displayRangeText}</span>
              <Calendar className="w-4 h-4 text-[#859398]" />
            </button>

            {isDatePickerOpen && (
              <div className="absolute left-0 right-0 mt-2 p-4 bg-[#0c162d] border border-[#3c494e]/50 rounded-2xl shadow-2xl z-50 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  {["Últimas 24 horas","Última semana","Último mes","Últimos 6 meses","Último año"].map((p) => (
                    <button key={p} onClick={() => handlePresetClick(p)} className={`py-2 px-2 text-[9px] rounded-lg border text-center font-bold transition-all ${tempPreset === p ? "bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]" : "bg-[#171f33]/40 border-[#3c494e]/20 text-[#859398] hover:border-[#859398]/40"}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 border-t border-[#3c494e]/20 pt-3">
                  <span className="text-[9px] font-bold text-[#859398] uppercase tracking-wider">Rango Personalizado</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-[#859398] uppercase">Desde</label>
                      <input type="date" value={tempStartDate} onChange={(e) => { setTempStartDate(e.target.value); setTempPreset("Personalizado"); }} className="bg-[#060e20] border border-[#3c494e]/30 rounded-lg p-2 text-[10px] text-white outline-none focus:border-[#00d4ff]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-[#859398] uppercase">Hasta</label>
                      <input type="date" value={tempEndDate} onChange={(e) => { setTempEndDate(e.target.value); setTempPreset("Personalizado"); }} className="bg-[#060e20] border border-[#3c494e]/30 rounded-lg p-2 text-[10px] text-white outline-none focus:border-[#00d4ff]" />
                    </div>
                  </div>
                </div>
                <button onClick={applyCustomRange} className="w-full py-2 bg-[#00d4ff] hover:bg-[#00b4d8] text-[#060e20] font-bold text-xs rounded-xl transition-all">
                  Aplicar Rango
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selector de Pozo (datos reales) */}
        <div className="flex flex-col gap-1 px-1">
          <label className="text-[9px] font-bold text-[#859398] tracking-widest uppercase">Selección de Pozo</label>
          <div className="relative">
            <select
              value={selectedWell}
              onChange={(e) => setSelectedWell(e.target.value)}
              disabled={wellsLoading}
              className="w-full glass-input px-3.5 py-2.5 bg-[#060e20]/60 border border-[#3c494e]/30 text-xs rounded-xl appearance-none cursor-pointer font-bold text-white outline-none disabled:opacity-50"
            >
              {wellsLoading ? (
                <option>Cargando pozos...</option>
              ) : (
                <>
                  {wells.map((w) => (
                    <option key={w.entity_id} value={w.entity_id}>
                      Pozo {shortId(w.entity_id)} — {w.total_registros?.toLocaleString("es-CL") ?? "?"} registros
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#859398]">
              {wellsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Botón Actualizar */}
        <button
          onClick={handleUpdate}
          disabled={updating || chartLoading}
          className="w-full py-2.5 px-4 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 font-bold text-[10px] tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 outline-none disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(updating || chartLoading) ? "animate-spin" : ""}`} />
          ACTUALIZAR DATOS
        </button>
      </div>

      {/* 2. TARJETAS KPI (datos reales desde /resumen) */}
      <div className="flex flex-col gap-3 px-2">
        {/* Nombre del pozo activo */}
        {selectedWell !== "Todos" && (
          <div className="flex items-center gap-2 px-1">
            <ProbeIcon />
            <span className="text-[10px] font-bold text-[#dae2fd] tracking-wide uppercase truncate">
              {selectedWellLabel}
            </span>
            {resumen?.ultimo_registro && (
              <span className="text-[8px] text-[#859398] ml-auto whitespace-nowrap">
                Último: {new Date(resumen.ultimo_registro).toLocaleString("es-CL", { timeStyle: "short", dateStyle: "short" })}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {chartLoading ? (
            <><CardSkeleton /><CardSkeleton /></>
          ) : (
            <>
              <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
                <span className="text-2xl font-extrabold text-[#00d4ff] font-mono leading-none glow-cyan">
                  {fmtNum(resumen?.caudal_promedio)} <span className="text-[10px] font-normal text-[#859398]">m³/h</span>
                </span>
                <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Caudal Promedio</span>
              </div>
              <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
                <span className="text-2xl font-extrabold text-[#ffcd56] font-mono leading-none">
                  {fmtNum(resumen?.nivel_promedio)} <span className="text-[10px] font-normal text-[#859398]">m</span>
                </span>
                <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Nivel Freático Prom.</span>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {chartLoading ? (
            <><CardSkeleton /><CardSkeleton /></>
          ) : (
            <>
              <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
                <span className="text-2xl font-extrabold text-[#00d4ff] font-mono leading-none glow-cyan">
                  {fmtNum(resumen?.caudal_maximo)} <span className="text-[10px] font-normal text-[#859398]">m³/h</span>
                </span>
                <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Caudal Máximo</span>
              </div>
              <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
                <span className="text-2xl font-extrabold text-[#ffcd56] font-mono leading-none">
                  {fmtNum(resumen?.nivel_maximo)} <span className="text-[10px] font-normal text-[#859398]">m</span>
                </span>
                <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Nivel Máximo</span>
              </div>
            </>
          )}
        </div>

        {/* Totalizador acumulado */}
        <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
          {chartLoading ? (
            <div className="h-8 w-28 bg-[#3c494e]/40 rounded animate-pulse" />
          ) : (
            <>
              <span className="text-3xl font-extrabold text-[#00d4ff] font-mono leading-none glow-cyan">
                {fmtNum(resumen?.totalizador_ultimo, 0)} <span className="text-xs font-normal text-[#859398]">m³</span>
              </span>
              <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Totalizador Acumulado</span>
            </>
          )}
        </div>

        {/* Registros y estado */}
        {!chartLoading && resumen && (
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-3 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/20">
              <span className="text-lg font-extrabold text-white font-mono">{resumen.total_registros.toLocaleString("es-CL")}</span>
              <span className="text-[7px] font-bold text-[#859398] tracking-widest uppercase text-center mt-1">Registros en rango</span>
            </div>
            <div className="glass-card p-3 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/20">
              <span className="text-lg font-extrabold text-[#00d4ff] font-mono">{fmtNum(resumen.caudal_minimo)}</span>
              <span className="text-[7px] font-bold text-[#859398] tracking-widest uppercase text-center mt-1">Caudal Mínimo m³/h</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. GRÁFICO PRINCIPAL: Caudal + Nivel (datos reales) */}
      <div
        onClick={() => setHoveredLineIndex(null)}
        className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-4 relative"
      >
        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide font-sora">Gráfico Dinámico</h3>
            <p className="text-[8px] text-[#859398] mt-0.5 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {selectedWellLabel} — {displayRangeText}
            </p>
          </div>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1 bg-[#171f33] border border-[#3c494e]/30 rounded-lg text-[#859398] hover:text-white transition-all active:scale-95 outline-none"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {renderLineChart()}
        {!chartLoading && !chartError && lineChartData.length >= 2 && <ChartLegend />}
      </div>

      {/* 4. GRÁFICO 2: Semanal */}
      <div className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-4 relative">
        <h3 className="text-xs font-bold text-white tracking-wide font-sora">Volumen Acumulado Semanal</h3>
        <div className="w-full mt-2 relative">
          <svg viewBox="0 0 450 160" className="w-full h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            {weeklyData.map((item, idx) => {
              const { x, y, barHeight } = weeklyCoords[idx];
              const isSelected = selectedWeeklyIndex === idx;
              return (
                <g key={idx} onClick={() => setSelectedWeeklyIndex(idx)} className="cursor-pointer">
                  <rect x={x - 20} y={10} width="75" height="130" fill="transparent" pointerEvents="all" />
                  <rect x={x} y={20} width="35" height="110" fill="#060e20" rx="4" opacity="0.5" />
                  <rect x={x} y={y} width="35" height={barHeight} fill={isSelected ? "#00d4ff" : "#1b2d4f"} rx="4" className="transition-colors hover:fill-[#00d4ff]/80" style={{ filter: isSelected ? "drop-shadow(0px 0px 4px rgba(0, 212, 255, 0.6))" : "none" }} />
                  <text x={x + 17.5} y="148" fill={isSelected ? "#00d4ff" : "#859398"} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight={isSelected ? "bold" : "normal"}>{item.label}</text>
                </g>
              );
            })}
          </svg>
          {selectedWeeklyIndex !== null && (
            <div className="absolute bg-[#0c162d]/95 border border-[#00d4ff]/50 rounded-xl p-2.5 shadow-2xl text-[9px] font-mono text-white pointer-events-auto z-50 flex flex-col gap-1" style={{ left: `${((weeklyCoords[selectedWeeklyIndex].x + 17.5) / 450) * 100}%`, top: `${((weeklyCoords[selectedWeeklyIndex].y - 15) / 160) * 100}%`, transform: "translate(-50%, -100%)", width: "150px" }}>
              <div className="flex items-center justify-between border-b border-[#3c494e]/30 pb-1 mb-1">
                <span className="font-bold text-[#859398]">{weeklyData[selectedWeeklyIndex].dateRange}</span>
                <button onClick={(e) => { e.stopPropagation(); setSelectedWeeklyIndex(null); }} className="text-[#859398] hover:text-white font-bold px-1">×</button>
              </div>
              <div className="flex flex-col">
                <span className="text-[#859398] text-[8px] uppercase">Volumen semanal</span>
                <span className="text-[#00d4ff] text-xs font-extrabold">{weeklyData[selectedWeeklyIndex].val.toLocaleString("es-CL")} m³</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. GRÁFICO 3: Mensual */}
      <div className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white tracking-wide font-sora">Volumen Acumulado Mensual</h3>
          <Calendar className="w-4 h-4 text-[#859398]" />
        </div>
        <div className="w-full mt-2 relative">
          <svg viewBox="0 0 450 160" className="w-full h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            {monthlyData.map((item, idx) => {
              const { x, y, barHeight } = monthlyCoords[idx];
              const isSelected = selectedMonthlyIndex === idx;
              return (
                <g key={idx} onClick={() => setSelectedMonthlyIndex(idx)} className="cursor-pointer">
                  <rect x={x - 17.5} y={10} width="65" height="130" fill="transparent" pointerEvents="all" />
                  <rect x={x} y={20} width="30" height="110" fill="#060e20" rx="4" opacity="0.4" />
                  <rect x={x} y={y} width="30" height={barHeight} fill={isSelected ? "#00d4ff" : "#1b2d4f"} rx="4" className="transition-colors hover:fill-[#00d4ff]/80" style={{ filter: isSelected ? "drop-shadow(0px 0px 4px rgba(0, 212, 255, 0.6))" : "none" }} />
                  <text x={x + 15} y="148" fill={isSelected ? "#00d4ff" : "#859398"} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight={isSelected ? "bold" : "normal"}>{item.month}</text>
                </g>
              );
            })}
          </svg>
          {selectedMonthlyIndex !== null && (
            <div className="absolute bg-[#0c162d]/95 border border-[#00d4ff]/50 rounded-xl p-2.5 shadow-2xl text-[9px] font-mono text-white pointer-events-auto z-50 flex flex-col gap-1" style={{ left: `${((monthlyCoords[selectedMonthlyIndex].x + 15) / 450) * 100}%`, top: `${((monthlyCoords[selectedMonthlyIndex].y - 15) / 160) * 100}%`, transform: "translate(-50%, -100%)", width: "140px" }}>
              <div className="flex items-center justify-between border-b border-[#3c494e]/30 pb-1 mb-1">
                <span className="font-bold text-[#859398]">{monthlyData[selectedMonthlyIndex].fullMonth}</span>
                <button onClick={(e) => { e.stopPropagation(); setSelectedMonthlyIndex(null); }} className="text-[#859398] hover:text-white font-bold px-1">×</button>
              </div>
              <div className="flex flex-col">
                <span className="text-[#859398] text-[8px] uppercase">Volumen mensual</span>
                <span className="text-[#00d4ff] text-xs font-extrabold">{monthlyData[selectedMonthlyIndex].val.toLocaleString("es-CL")} m³</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. GRÁFICO 4: Anual */}
      <div className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white tracking-wide font-sora">Volumen Acumulado Anual</h3>
          <Info className="w-4 h-4 text-[#859398]" />
        </div>
        <div className="w-full mt-2 relative">
          <svg viewBox="0 0 450 160" className="w-full h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            {anualData.map((item, idx) => {
              const { x, y, barHeight } = anualCoords[idx];
              const isSelected = selectedAnualIndex === idx;
              return (
                <g key={idx} onClick={() => setSelectedAnualIndex(idx)} className="cursor-pointer">
                  <rect x={x - 20} y={10} width="75" height="130" fill="transparent" pointerEvents="all" />
                  <rect x={x} y={20} width="35" height="110" fill="#060e20" rx="4" opacity="0.4" />
                  <rect x={x} y={y} width="35" height={barHeight} fill={isSelected ? "#00d4ff" : "#1b2d4f"} rx="4" className="hover:fill-[#00d4ff]/80 transition-colors" style={{ filter: isSelected ? "drop-shadow(0px 0px 4px rgba(0, 212, 255, 0.6))" : "none" }} />
                  <text x={x + 17.5} y="148" fill={isSelected ? "#00d4ff" : "#859398"} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight={isSelected ? "bold" : "normal"}>{item.year}</text>
                </g>
              );
            })}
          </svg>
          {selectedAnualIndex !== null && (
            <div className="absolute bg-[#0c162d]/95 border border-[#00d4ff]/50 rounded-xl p-2.5 shadow-2xl text-[9px] font-mono text-white pointer-events-auto z-50 flex flex-col gap-1" style={{ left: `${((anualCoords[selectedAnualIndex].x + 17.5) / 450) * 100}%`, top: `${((anualCoords[selectedAnualIndex].y - 15) / 160) * 100}%`, transform: "translate(-50%, -100%)", width: "140px" }}>
              <div className="flex items-center justify-between border-b border-[#3c494e]/30 pb-1 mb-1">
                <span className="font-bold text-[#859398]">{anualData[selectedAnualIndex].fullYear}</span>
                <button onClick={(e) => { e.stopPropagation(); setSelectedAnualIndex(null); }} className="text-[#859398] hover:text-white font-bold px-1">×</button>
              </div>
              <div className="flex flex-col">
                <span className="text-[#859398] text-[8px] uppercase">Volumen anual</span>
                <span className="text-[#00d4ff] text-xs font-extrabold">{anualData[selectedAnualIndex].val.toLocaleString("es-CL")} m³</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. MODAL PANTALLA COMPLETA */}
      {isFullscreen && (
        <div
          onClick={() => setHoveredLineIndex(null)}
          className="fixed inset-0 z-50 bg-[#0b1326] flex flex-col p-5 md:p-8 animate-fade-in overflow-y-auto"
        >
          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-between min-h-full">

            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-[#3c494e]/20 pb-3" onClick={(e) => e.stopPropagation()}>
              <div>
                <span className="text-[9px] font-bold text-[#00d4ff] tracking-widest uppercase block">VISTA DETALLADA</span>
                <h2 className="text-sm font-extrabold text-white tracking-wide font-sora mt-0.5">
                  Gráfico Dinámico — {selectedWellLabel}
                </h2>
              </div>
              <button
                onClick={() => { setHoveredLineIndex(null); setIsFullscreenDatePickerOpen(false); setIsFullscreen(false); }}
                className="p-2 bg-[#171f33]/80 border border-[#3c494e]/30 rounded-xl text-[#dae2fd] hover:text-white transition-all active:scale-95 outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros en pantalla completa */}
            <div className="flex flex-col gap-2 py-3 border-b border-[#3c494e]/20" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col gap-1" ref={fullscreenPopoverRef}>
                <label className="text-[8px] font-bold text-[#859398] tracking-widest uppercase">Rango Global de Tiempo</label>
                <div className="relative">
                  <button onClick={() => setIsFullscreenDatePickerOpen(!isFullscreenDatePickerOpen)} className="w-full pl-3 pr-8 py-2 bg-[#060e20]/60 border border-[#3c494e]/30 text-[11px] rounded-xl text-left font-bold text-[#dae2fd] flex items-center justify-between outline-none">
                    <span className="truncate">{displayRangeText}</span>
                    <Calendar className="w-3.5 h-3.5 text-[#859398]" />
                  </button>
                  {isFullscreenDatePickerOpen && (
                    <div className="absolute left-0 right-0 mt-2 p-3 bg-[#0c162d] border border-[#3c494e]/50 rounded-2xl shadow-2xl z-50 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-1.5">
                        {["Últimas 24 horas","Última semana","Último mes","Últimos 6 meses","Último año"].map((p) => (
                          <button key={p} onClick={() => handlePresetClick(p)} className={`py-1.5 px-2 text-[9px] rounded-lg border text-center font-bold transition-all ${tempPreset === p ? "bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]" : "bg-[#171f33]/40 border-[#3c494e]/20 text-[#859398] hover:border-[#859398]/40"}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-t border-[#3c494e]/20 pt-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-[#859398] uppercase">Desde</label>
                          <input type="date" value={tempStartDate} onChange={(e) => { setTempStartDate(e.target.value); setTempPreset("Personalizado"); }} className="bg-[#060e20] border border-[#3c494e]/30 rounded-lg p-1.5 text-[10px] text-white outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-[#859398] uppercase">Hasta</label>
                          <input type="date" value={tempEndDate} onChange={(e) => { setTempEndDate(e.target.value); setTempPreset("Personalizado"); }} className="bg-[#060e20] border border-[#3c494e]/30 rounded-lg p-1.5 text-[10px] text-white outline-none" />
                        </div>
                      </div>
                      <button onClick={applyCustomRange} className="w-full py-1.5 bg-[#00d4ff] hover:bg-[#00b4d8] text-[#060e20] font-bold text-[10px] rounded-xl transition-all">
                        Aplicar Rango
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Selector de pozo en pantalla completa */}
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-bold text-[#859398] tracking-widest uppercase">Pozo</label>
                <div className="relative">
                  <select
                    value={selectedWell}
                    onChange={(e) => setSelectedWell(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060e20]/60 border border-[#3c494e]/30 text-[10px] rounded-xl appearance-none cursor-pointer font-bold text-white outline-none"
                  >
                    {wells.map((w) => (
                      <option key={w.entity_id} value={w.entity_id}>
                        Pozo {shortId(w.entity_id)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#859398]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* KPIs en fila */}
            <div className="grid grid-cols-3 gap-2 py-3 border-b border-[#3c494e]/20" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center">
                <span className="text-xs font-extrabold text-[#00d4ff]">{fmtNum(resumen?.caudal_promedio)}</span>
                <span className="text-[7px] text-[#859398] uppercase">Caudal Prom. m³/h</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-extrabold text-[#ffcd56]">{fmtNum(resumen?.nivel_promedio)}</span>
                <span className="text-[7px] text-[#859398] uppercase">Nivel Prom. m</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-extrabold text-white">{fmtNum(resumen?.totalizador_ultimo, 0)}</span>
                <span className="text-[7px] text-[#859398] uppercase">Totalizador m³</span>
              </div>
            </div>

            {/* Gráfico grande */}
            <div className="flex-1 flex flex-col gap-2 py-4" onClick={(e) => e.stopPropagation()}>
              {renderLineChart()}
              {!chartLoading && !chartError && lineChartData.length >= 2 && <ChartLegend />}
            </div>

            {/* Intervalo auto */}
            <div className="flex items-center justify-between pt-3 border-t border-[#3c494e]/20" onClick={(e) => e.stopPropagation()}>
              <span className="text-[8px] text-[#859398]">
                Intervalo: <span className="text-white font-bold">{getAutoInterval(startDate, endDate)}</span>
              </span>
              <span className="text-[8px] text-[#859398]">
                {lineChartData.length} puntos
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
