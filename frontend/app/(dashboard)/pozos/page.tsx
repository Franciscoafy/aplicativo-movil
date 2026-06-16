"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Calendar, 
  RefreshCw, 
  ChevronDown, 
  BarChart3, 
  Droplet, 
  Info,
  Clock,
  Maximize2,
  X
} from "lucide-react";

const ProbeIcon = () => (
  <svg className="w-5 h-5 text-[#00d4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4v16M12 4v16M16 4v16M8 9h8M8 15h8" />
  </svg>
);

const MOCK_WELLS = [
  { id: "CASUB-0009", name: "CASUB - 0009", status: "active", baseCaudal: 10.5, baseNivel: 38.2, baseTurbidez: 0.8 },
  { id: "CASUB-0039", name: "CASUB - 0039", status: "active", baseCaudal: 8.4, baseNivel: 42.1, baseTurbidez: 1.2 },
  { id: "CASUB-0049", name: "CASUB - 0049", status: "active", baseCaudal: 12.1, baseNivel: 47.5, baseTurbidez: 1.9 },
  { id: "CASUB-0056", name: "CASUB - 0056", status: "active", baseCaudal: 5.2, baseNivel: 32.8, baseTurbidez: 0.5 },
  { id: "CASUB-0063", name: "CASUB - 0063", status: "active", baseCaudal: 14.8, baseNivel: 54.0, baseTurbidez: 3.1 },
  { id: "CASUB-0064", name: "CASUB - 0064", status: "inactive", baseCaudal: 0.0, baseNivel: 28.5, baseTurbidez: 0.0 },
];

export default function PozosPage() {
  const [selectedWell, setSelectedWell] = useState("Todos");
  const [updating, setUpdating] = useState(false);

  // Rango de Fechas Global
  const [startDate, setStartDate] = useState("2025-12-16");
  const [endDate, setEndDate] = useState("2026-06-16");
  const [preset, setPreset] = useState("Últimos 6 meses");

  // Temporales de Rango de Fechas (Popover)
  const [tempStartDate, setTempStartDate] = useState("2025-12-16");
  const [tempEndDate, setTempEndDate] = useState("2026-06-16");
  const [tempPreset, setTempPreset] = useState("Últimos 6 meses");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenDatePickerOpen, setIsFullscreenDatePickerOpen] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const fullscreenPopoverRef = useRef<HTMLDivElement>(null);

  // Cerrar popover al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar popover de pantalla completa al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fullscreenPopoverRef.current && !fullscreenPopoverRef.current.contains(event.target as Node)) {
        setIsFullscreenDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bloquear scroll de la página al estar en pantalla completa
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  // Calcular fechas para presets
  const handlePresetClick = (selectedPreset: string) => {
    setTempPreset(selectedPreset);
    const end = new Date("2026-06-16");
    const start = new Date("2026-06-16");
    
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
    setTimeout(() => {
      setUpdating(false);
    }, 600);
  };

  // Multiplicador según el pozo seleccionado para simular reactividad
  const wellMultiplier = useMemo(() => {
    if (selectedWell === "Todos") return 1.0;
    const well = MOCK_WELLS.find(w => w.name === selectedWell);
    if (!well) return 1.0;
    if (well.status === "inactive") return 0.0;
    return well.baseCaudal / 10.5; // Relativo al promedio
  }, [selectedWell]);

  // Cantidad de días seleccionados para escalar consumos
  const diffDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }, [startDate, endDate]);

  // Consumos calculados dinámicamente
  const consumptions = useMemo(() => {
    const baseDaily = 12.4 * wellMultiplier;
    const baseWeekly = 84.2 * wellMultiplier;
    const baseMonthly = 342.1 * wellMultiplier;
    const baseAnnual = 4200 * wellMultiplier;
    const baseAccumulated = 18900 * wellMultiplier * (diffDays / 180);

    const formatVal = (v: number, isK: boolean = false) => {
      if (v === 0) return "0.0";
      if (isK) {
        return `${(v / 1000).toFixed(1)}k`;
      }
      return v.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

    return {
      daily: formatVal(baseDaily),
      weekly: formatVal(baseWeekly),
      monthly: formatVal(baseMonthly),
      annual: formatVal(baseAnnual, baseAnnual >= 1000),
      accumulated: formatVal(baseAccumulated, baseAccumulated >= 1000),
    };
  }, [wellMultiplier, diffDays]);

  // 1. Datos dinámicos del Gráfico de 3 Líneas (Adaptable al rango de tiempo)
  const lineChartData = useMemo(() => {
    const points = [];
    let start = new Date(startDate + "T00:00:00");
    let end = new Date(endDate + "T00:00:00");
    
    // Si la fecha inicial y final son iguales, representar un rango de 24 horas
    if (start.getTime() === end.getTime()) {
      end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    }
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    let steps = 8;
    let formatType: "hour" | "day" | "month" = "month";

    if (preset === "Últimas 24 horas" || diffDays <= 1.5) {
      // Período de un día o menor: eje X por hora
      steps = 24;
      formatType = "hour";
    } else if (diffDays <= 15) {
      // Entre 1.5 y 15 días: eje X por día
      steps = Math.max(2, Math.round(diffDays));
      formatType = "day";
    } else {
      // Rango mayor: 8 puntos distribuidos
      steps = 8;
      formatType = "month";
    }

    for (let i = 0; i < steps; i++) {
      let current: Date;
      if (steps > 1) {
        current = new Date(start.getTime() + (diffTime * i) / (steps - 1));
      } else {
        current = new Date(start.getTime());
      }

      let label = "";
      let fullLabel = "";

      if (formatType === "hour") {
        const hh = current.getHours().toString().padStart(2, "0");
        const mm = current.getMinutes().toString().padStart(2, "0");
        label = `${hh}:${mm}`;
        fullLabel = `${current.toLocaleDateString("es-CL")} ${label}`;
      } else {
        label = `${current.getDate().toString().padStart(2, "0")}/${(current.getMonth() + 1).toString().padStart(2, "0")}`;
        fullLabel = current.toLocaleDateString("es-CL");
      }

      // Valores base con fluctuaciones senoidales
      const wave = Math.sin(i * 1.5);
      const noise = Math.cos(i * 0.8) * 0.3;

      const caudalVal = wellMultiplier === 0 
        ? 0 
        : Math.max(0.2, 8.5 * wellMultiplier + wave * 2 + noise);

      const nivelVal = wellMultiplier === 0
        ? 28.5
        : Math.max(10, 38.2 + wave * 6 + noise * 2);

      const totalizadorVal = wellMultiplier === 0
        ? 1200
        : Math.round(5000 + i * (3500 * wellMultiplier) + wave * 400);

      points.push({
        label,
        fullLabel,
        caudal: parseFloat(caudalVal.toFixed(2)),
        nivel: parseFloat(nivelVal.toFixed(2)),
        totalizador: totalizadorVal
      });
    }
    return points;
  }, [startDate, endDate, preset, wellMultiplier]);

  // Dimensiones del gráfico de líneas SVG
  const width = 450;
  const height = isFullscreen ? 340 : 220;
  const padding = { top: 20, right: 45, bottom: 30, left: 45 };

  // Estados interactivos para tooltip del gráfico de líneas
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [lineTooltipPos, setLineTooltipPos] = useState({ x: 0, y: 0 });

  const lineChartCoords = useMemo(() => {
    const caudals = lineChartData.map(c => c.caudal);
    const nivels = lineChartData.map(c => c.nivel);
    const totalizadors = lineChartData.map(c => c.totalizador);

    const minC = Math.min(...caudals);
    const maxC = Math.max(...caudals) || 10;
    const minN = Math.min(...nivels);
    const maxN = Math.max(...nivels) || 50;
    const minT = Math.min(...totalizadors);
    const maxT = Math.max(...totalizadors) || 15000;

    const getXCoord = (index: number) => {
      const chartWidth = width - padding.left - padding.right;
      return padding.left + (index / (lineChartData.length - 1)) * chartWidth;
    };

    const getCaudalY = (val: number) => {
      const scale = maxC === minC ? 0.5 : (val - minC) / (maxC - minC);
      return height - padding.bottom - scale * (height - padding.top - padding.bottom - 40) - 20;
    };

    const getNivelY = (val: number) => {
      const scale = maxN === minN ? 0.5 : (val - minN) / (maxN - minN);
      return height - padding.bottom - scale * (height - padding.top - padding.bottom - 40) - 20;
    };

    const getTotalizadorY = (val: number) => {
      const scale = maxT === minT ? 0.5 : (val - minT) / (maxT - minT);
      return height - padding.bottom - scale * (height - padding.top - padding.bottom - 40) - 20;
    };

    // Generar paths
    let caudalPath = `M ${getXCoord(0)} ${getCaudalY(lineChartData[0].caudal)}`;
    let nivelPath = `M ${getXCoord(0)} ${getNivelY(lineChartData[0].nivel)}`;
    let totalizadorPath = `M ${getXCoord(0)} ${getTotalizadorY(lineChartData[0].totalizador)}`;

    for (let i = 1; i < lineChartData.length; i++) {
      caudalPath += ` L ${getXCoord(i)} ${getCaudalY(lineChartData[i].caudal)}`;
      nivelPath += ` L ${getXCoord(i)} ${getNivelY(lineChartData[i].nivel)}`;
      totalizadorPath += ` L ${getXCoord(i)} ${getTotalizadorY(lineChartData[i].totalizador)}`;
    }

    return { 
      getXCoord, 
      getCaudalY, 
      getNivelY, 
      getTotalizadorY, 
      caudalPath, 
      nivelPath, 
      totalizadorPath,
      minC,
      maxC,
      minN,
      maxN,
      minT,
      maxT
    };
  }, [lineChartData, height]);

  // Manejador interactivo táctil y mouse para el gráfico dinámico de 3 líneas
  const handleLineInteraction = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    e.stopPropagation();

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    let clientX: number;
    let clientY: number;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      if (e.type === "touchmove" && e.cancelable) {
        e.preventDefault();
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    
    const svgX = (localX / rect.width) * width;
    const svgY = (localY / rect.height) * height;
    
    const chartWidth = width - padding.left - padding.right;
    const relativeX = svgX - padding.left;
    const pct = relativeX / chartWidth;
    const index = Math.min(
      lineChartData.length - 1,
      Math.max(0, Math.round(pct * (lineChartData.length - 1)))
    );
    
    setHoveredLineIndex(index);
    setLineTooltipPos({ x: svgX, y: svgY });
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    
    const svgX = (localX / rect.width) * width;
    const svgY = (localY / rect.height) * height;
    
    const chartWidth = width - padding.left - padding.right;
    const relativeX = svgX - padding.left;
    const pct = relativeX / chartWidth;
    const index = Math.min(
      lineChartData.length - 1,
      Math.max(0, Math.round(pct * (lineChartData.length - 1)))
    );
    
    if (hoveredLineIndex === index) {
      setHoveredLineIndex(null);
    } else {
      setHoveredLineIndex(index);
      setLineTooltipPos({ x: svgX, y: svgY });
    }
  };

  // 2. Gráfico 2: Datos agregados por Semana
  const weeklyData = useMemo(() => {
    const end = new Date(endDate);
    const weeks = [];
    for (let i = 4; i >= 0; i--) {
      const wEnd = new Date(end);
      wEnd.setDate(end.getDate() - i * 7);
      const wStart = new Date(wEnd);
      wStart.setDate(wEnd.getDate() - 6);
      
      const startStr = `${wStart.getDate().toString().padStart(2, "0")}/${(wStart.getMonth() + 1).toString().padStart(2, "0")}`;
      const endStr = `${wEnd.getDate().toString().padStart(2, "0")}/${(wEnd.getMonth() + 1).toString().padStart(2, "0")}`;
      const val = 84.2 * wellMultiplier * (0.85 + Math.sin(i * 1.3) * 0.12);
      
      weeks.push({
        label: `S${5 - i}`,
        dateRange: `${startStr} - ${endStr}`,
        val: parseFloat(val.toFixed(1))
      });
    }
    return weeks;
  }, [endDate, wellMultiplier]);

  const weeklyCoords = useMemo(() => {
    return weeklyData.map((item, idx) => {
      const val = item.val;
      const maxVal = 150 * wellMultiplier || 10;
      const barHeight = Math.min(110, (val / maxVal) * 110) || 0;
      const x = 50 + idx * 75;
      const y = 130 - barHeight;
      return { x, y, barHeight };
    });
  }, [weeklyData, wellMultiplier]);

  const [selectedWeeklyIndex, setSelectedWeeklyIndex] = useState<number | null>(4);

  // 3. Gráfico 3: Volumen Acumulado Mensual (Una barra por mes)
  const monthlyData = useMemo(() => {
    const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN"];
    const base = [342, 310, 365, 390, 420, 480]; // Valores en m3
    return months.map((m, idx) => ({
      month: m,
      fullMonth: `${m} 2026`,
      val: Math.round(base[idx] * wellMultiplier)
    }));
  }, [wellMultiplier]);

  const monthlyCoords = useMemo(() => {
    return monthlyData.map((item, idx) => {
      const maxVal = 600;
      const barHeight = (item.val / maxVal) * 110;
      const x = 45 + idx * 65;
      const y = 130 - barHeight;
      return { x, y, barHeight };
    });
  }, [monthlyData]);

  const [selectedMonthlyIndex, setSelectedMonthlyIndex] = useState<number | null>(5);

  // 4. Gráfico 4: Volumen Acumulado Anual (Una barra por año)
  const anualData = useMemo(() => {
    const years = ["2022", "2023", "2024", "2025", "2026"];
    const base = [48000, 52000, 56000, 61000, 68000]; // Valores en m3
    return years.map((y, idx) => ({
      year: y,
      fullYear: `Año ${y}`,
      val: Math.round(base[idx] * wellMultiplier)
    }));
  }, [wellMultiplier]);

  const anualCoords = useMemo(() => {
    return anualData.map((item, idx) => {
      const maxVal = 80000;
      const barHeight = (item.val / maxVal) * 110;
      const x = 50 + idx * 75;
      const y = 130 - barHeight;
      return { x, y, barHeight };
    });
  }, [anualData]);

  const [selectedAnualIndex, setSelectedAnualIndex] = useState<number | null>(4);

  // Formatear rango de fecha a mostrar
  const displayRangeText = useMemo(() => {
    const formatDateStr = (str: string) => {
      const parts = str.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };
    if (preset === "Personalizado") {
      return `${formatDateStr(startDate)} - ${formatDateStr(endDate)}`;
    }
    return `${preset} (${formatDateStr(startDate)} - ${formatDateStr(endDate)})`;
  }, [startDate, endDate, preset]);

  return (
    <div className="flex flex-col gap-5 font-mono max-w-md mx-auto bg-[#0b1326] text-white pb-6 relative">
      
      {/* 1. FILTROS DE CABECERA - STICKY ON SCROLL */}
      <div className="sticky top-0 bg-[#0b1326]/95 backdrop-blur-md z-40 py-3 px-2 border-b border-[#3c494e]/20 flex flex-col gap-2.5 shadow-lg">
        {/* Rango de Fechas Global */}
        <div className="flex flex-col gap-1 px-1" ref={popoverRef}>
          <label className="text-[9px] font-bold text-[#859398] tracking-widest uppercase">
            Rango Global de Tiempo
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full pl-3.5 pr-10 py-2.5 bg-[#060e20]/60 border border-[#3c494e]/30 text-xs rounded-xl text-left font-bold text-[#dae2fd] flex items-center justify-between outline-none"
            >
              <span className="truncate">{displayRangeText}</span>
              <Calendar className="w-4 h-4 text-[#859398]" />
            </button>

            {/* Popover del Rango */}
            {isDatePickerOpen && (
              <div className="absolute left-0 right-0 mt-2 p-4 bg-[#0c162d] border border-[#3c494e]/50 rounded-2xl shadow-2xl z-50 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  {["Últimas 24 horas", "Última semana", "Último mes", "Últimos 6 meses", "Último año"].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePresetClick(p)}
                      className={`py-2 px-2 text-[9px] rounded-lg border text-center font-bold transition-all ${
                        tempPreset === p
                          ? "bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]"
                          : "bg-[#171f33]/40 border-[#3c494e]/20 text-[#859398] hover:border-[#859398]/40"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-2 border-t border-[#3c494e]/20 pt-3">
                  <span className="text-[9px] font-bold text-[#859398] uppercase tracking-wider">
                    Rango Personalizado
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-[#859398] uppercase">Desde</label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => {
                          setTempStartDate(e.target.value);
                          setTempPreset("Personalizado");
                        }}
                        className="bg-[#060e20] border border-[#3c494e]/30 rounded-lg p-2 text-[10px] text-white outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-[#859398] uppercase">Hasta</label>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => {
                          setTempEndDate(e.target.value);
                          setTempPreset("Personalizado");
                        }}
                        className="bg-[#060e20] border border-[#3c494e]/30 rounded-lg p-2 text-[10px] text-white outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={applyCustomRange}
                  className="w-full py-2 bg-[#00d4ff] hover:bg-[#00b4d8] text-[#060e20] font-bold text-xs rounded-xl transition-all"
                >
                  Aplicar Rango
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selector de Pozo */}
        <div className="flex flex-col gap-1 px-1">
          <label className="text-[9px] font-bold text-[#859398] tracking-widest uppercase">
            Selección de Pozo
          </label>
          <div className="relative">
            <select
              value={selectedWell}
              onChange={(e) => setSelectedWell(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 bg-[#060e20]/60 border border-[#3c494e]/30 text-xs rounded-xl appearance-none cursor-pointer font-bold text-white outline-none"
            >
              <option value="Todos">Todos los Pozos (Consolidador)</option>
              {MOCK_WELLS.map((well) => (
                <option key={well.id} value={well.name}>
                  {well.name} {well.status === "inactive" ? "(APAGADO)" : ""}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#859398]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Botón de Actualizar */}
        <button
          onClick={handleUpdate}
          disabled={updating}
          className="w-full py-2.5 px-4 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 font-bold text-[10px] tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 outline-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${updating ? "animate-spin" : ""}`} />
          ACTUALIZAR DATOS
        </button>
      </div>

      {/* 2. TARJETAS DE CONSUMO */}
      <div className="flex flex-col gap-3 px-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
            <span className="text-2xl font-extrabold text-[#00d4ff] font-mono leading-none glow-cyan">
              {consumptions.daily} <span className="text-[10px] font-normal text-[#859398]">m³</span>
            </span>
            <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Consumo Diario</span>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
            <span className="text-2xl font-extrabold text-[#00d4ff] font-mono leading-none glow-cyan">
              {consumptions.weekly} <span className="text-[10px] font-normal text-[#859398]">m³</span>
            </span>
            <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Consumo Semanal</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
            <span className="text-2xl font-extrabold text-[#00d4ff] font-mono leading-none glow-cyan">
              {consumptions.monthly} <span className="text-[10px] font-normal text-[#859398]">m³</span>
            </span>
            <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Consumo Mensual</span>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
            <span className="text-2xl font-extrabold text-[#00d4ff] font-mono leading-none glow-cyan">
              {consumptions.annual} <span className="text-[10px] font-normal text-[#859398]">m³</span>
            </span>
            <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Consumo Anual</span>
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/30">
          <span className="text-3xl font-extrabold text-[#00d4ff] font-mono leading-none glow-cyan">
            {consumptions.accumulated} <span className="text-xs font-normal text-[#859398]">m³</span>
          </span>
          <span className="text-[8px] font-bold text-[#859398] tracking-widest mt-2.5 uppercase text-center">Consumo Acumulado</span>
        </div>
      </div>

      {/* 3. GRÁFICO 1: Dinámico con Ejes X/Y y Tooltip de 3 parámetros */}
      <div 
        onClick={() => setHoveredLineIndex(null)}
        className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-4 relative"
      >
        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide font-sora">Gráfico Dinámico</h3>
            <p className="text-[8px] text-[#859398] mt-0.5 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Último período</p>
          </div>
          <button 
            onClick={() => setIsFullscreen(true)}
            title="Expandir a pantalla completa"
            className="p-1 bg-[#171f33] border border-[#3c494e]/30 rounded-lg text-[#859398] hover:text-white transition-all active:scale-95 outline-none"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full mt-2 relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none cursor-crosshair" onMouseMove={handleLineInteraction} onTouchStart={handleLineInteraction} onTouchMove={handleLineInteraction} onClick={handleSvgClick} onMouseLeave={() => setHoveredLineIndex(null)} xmlns="http://www.w3.org/2000/svg">
            {/* Grid horizontal lines */}
            <line x1={padding.left} y1={20} x2={width - padding.right} y2={20} stroke="#3c494e" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15" />
            <line x1={padding.left} y1={95} x2={width - padding.right} y2={95} stroke="#3c494e" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15" />
            <line x1={padding.left} y1={170} x2={width - padding.right} y2={170} stroke="#3c494e" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15" />

            {/* Ejes */}
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#3c494e" strokeWidth="1" opacity="0.6" />
            <line x1={width - padding.right} y1={padding.top} x2={width - padding.right} y2={height - padding.bottom} stroke="#3c494e" strokeWidth="1" opacity="0.6" />
            <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#3c494e" strokeWidth="1" opacity="0.6" />

            {/* Ticks Izquierda (Caudal L/s - Cyan) */}
            <text x={padding.left - 6} y={23} fill="#00d4ff" fontSize="7" textAnchor="end" fontFamily="monospace" fontWeight="bold">
              {lineChartCoords.maxC.toFixed(1)} L/s
            </text>
            <text x={padding.left - 6} y={98} fill="#00d4ff" fontSize="7" textAnchor="end" fontFamily="monospace">
              {((lineChartCoords.maxC + lineChartCoords.minC) / 2).toFixed(1)}
            </text>
            <text x={padding.left - 6} y={173} fill="#00d4ff" fontSize="7" textAnchor="end" fontFamily="monospace">
              {lineChartCoords.minC.toFixed(1)}
            </text>

            {/* Ticks Derecha (Nivel m - Yellow) */}
            <text x={width - padding.right + 6} y={23} fill="#ffcd56" fontSize="7" textAnchor="start" fontFamily="monospace" fontWeight="bold">
              {lineChartCoords.maxN.toFixed(1)} m
            </text>
            <text x={width - padding.right + 6} y={98} fill="#ffcd56" fontSize="7" textAnchor="start" fontFamily="monospace">
              {((lineChartCoords.maxN + lineChartCoords.minN) / 2).toFixed(1)}
            </text>
            <text x={width - padding.right + 6} y={173} fill="#ffcd56" fontSize="7" textAnchor="start" fontFamily="monospace">
              {lineChartCoords.minN.toFixed(1)}
            </text>

            {/* Ticks Eje X (Fechas con densidad adaptable) */}
            {lineChartData.map((item, idx) => {
              const x = lineChartCoords.getXCoord(idx);
              let showLabel = true;
              if (lineChartData.length > 15) {
                // Modo por hora (24 puntos)
                showLabel = idx % 6 === 0; // Mostrar cada 6 horas en vista normal
              } else if (lineChartData.length > 8) {
                // Modo diario (9 a 15 días)
                showLabel = idx % 2 === 0; // Mostrar días alternos en vista normal
              }
              if (!showLabel) return null;
              return (
                <text key={idx} x={x} y={height - padding.bottom + 14} fill="#859398" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                  {item.label}
                </text>
              );
            })}

            {/* Paths de los datos */}
            <path d={lineChartCoords.caudalPath} fill="none" stroke="#00d4ff" strokeWidth="2.2" strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(0,212,255,0.4)]" />
            <path d={lineChartCoords.nivelPath} fill="none" stroke="#ffcd56" strokeWidth="2.2" strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(255,205,86,0.4)]" />
            <path d={lineChartCoords.totalizadorPath} fill="none" stroke="#859398" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2" />

            {/* Línea vertical de guía interacción */}
            {hoveredLineIndex !== null && (
              <line x1={lineChartCoords.getXCoord(hoveredLineIndex)} y1={padding.top} x2={lineChartCoords.getXCoord(hoveredLineIndex)} y2={height - padding.bottom} stroke="rgba(0, 212, 255, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
            )}
          </svg>

          {/* Tooltip de 3 parámetros */}
          {hoveredLineIndex !== null && (
            <div onClick={(e) => e.stopPropagation()} className="absolute bg-[#0c162d]/95 border border-[#00d4ff]/40 rounded-xl p-3 shadow-2xl text-[9px] pointer-events-none z-50 w-[170px]" style={{ left: `${(lineTooltipPos.x / 450) * 100}%`, top: `${((lineTooltipPos.y - 15) / height) * 100}%`, transform: 'translate(-50%, -100%)' }}>
              <span className="font-bold text-[#859398] border-b border-[#3c494e]/30 pb-1 mb-1 block">{lineChartData[hoveredLineIndex].fullLabel}</span>
              <div className="flex justify-between"><span className="text-[#ffcd56]">Nivel:</span><span className="font-bold">{lineChartData[hoveredLineIndex].nivel.toFixed(1)} m</span></div>
              <div className="flex justify-between"><span className="text-[#00d4ff]">Caudal:</span><span className="font-bold">{lineChartData[hoveredLineIndex].caudal.toFixed(1)} L/s</span></div>
              <div className="flex justify-between"><span className="text-[#a0aec0]">Totalizador:</span><span className="font-bold text-white">{lineChartData[hoveredLineIndex].totalizador.toLocaleString("es-CL")} m³</span></div>
            </div>
          )}
        </div>
      </div>

      {/* 4. GRÁFICO 2: Semanal con Tooltip */}
      <div className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-4 relative">
        <h3 className="text-xs font-bold text-white tracking-wide font-sora">Volumen Acumulado Semanal</h3>
        <div className="w-full mt-2 relative">
          <svg viewBox="0 0 450 160" className="w-full h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            {weeklyData.map((item, idx) => {
              const { x, y, barHeight } = weeklyCoords[idx];
              const isSelected = selectedWeeklyIndex === idx;
              const barColor = isSelected ? "#00d4ff" : "#1b2d4f";
              return (
                <g key={idx} onClick={() => setSelectedWeeklyIndex(idx)} className="cursor-pointer">
                  {/* Invisible broad tap target for mobile touch reliability */}
                  <rect x={x - 20} y={10} width="75" height="130" fill="transparent" pointerEvents="all" />
                  
                  <rect x={x} y={20} width="35" height="110" fill="#060e20" rx="4" opacity="0.5" />
                  <rect x={x} y={y} width="35" height={barHeight} fill={barColor} rx="4" className="transition-colors hover:fill-[#00d4ff]/80" style={{ filter: isSelected ? "drop-shadow(0px 0px 4px rgba(0, 212, 255, 0.6))" : "none" }} />
                  <text x={x + 17.5} y="148" fill={isSelected ? "#00d4ff" : "#859398"} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight={isSelected ? "bold" : "normal"}>{item.label}</text>
                </g>
              );
            })}
          </svg>

          {selectedWeeklyIndex !== null && (
            <div className="absolute bg-[#0c162d]/95 border border-[#00d4ff]/50 rounded-xl p-2.5 shadow-2xl text-[9px] font-mono text-white pointer-events-auto z-50 flex flex-col gap-1" style={{ left: `${((weeklyCoords[selectedWeeklyIndex].x + 17.5) / 450) * 100}%`, top: `${((weeklyCoords[selectedWeeklyIndex].y - 15) / 160) * 100}%`, transform: 'translate(-50%, -100%)', width: '150px' }}>
              <div className="flex items-center justify-between border-b border-[#3c494e]/30 pb-1 mb-1">
                <span className="font-bold text-[#859398]">{weeklyData[selectedWeeklyIndex].dateRange}</span>
                <button onClick={(e) => { e.stopPropagation(); setSelectedWeeklyIndex(null); }} className="text-[#859398] hover:text-white font-bold px-1">×</button>
              </div>
              <div className="flex flex-col">
                <span className="text-[#859398] text-[8px] uppercase">Volumen semanal</span>
                <span className="text-[#00d4ff] text-xs font-extrabold font-mono">{weeklyData[selectedWeeklyIndex].val.toLocaleString("es-CL")} m³</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. GRÁFICO 3: Volumen Acumulado Mensual con Tooltip */}
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
              const barColor = isSelected ? "#00d4ff" : "#1b2d4f";

              return (
                <g 
                  key={idx}
                  onClick={() => setSelectedMonthlyIndex(idx)}
                  className="cursor-pointer"
                >
                  {/* Invisible broad tap target for mobile touch reliability */}
                  <rect x={x - 17.5} y={10} width="65" height="130" fill="transparent" pointerEvents="all" />

                  <rect x={x} y={20} width="30" height="110" fill="#060e20" rx="4" opacity="0.4" />
                  <rect x={x} y={y} width="30" height={barHeight} fill={barColor} rx="4" className="transition-colors hover:fill-[#00d4ff]/80" style={{ filter: isSelected ? "drop-shadow(0px 0px 4px rgba(0, 212, 255, 0.6))" : "none" }} />
                  <text x={x + 15} y="148" fill={isSelected ? "#00d4ff" : "#859398"} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight={isSelected ? "bold" : "normal"}>{item.month}</text>
                </g>
              );
            })}
          </svg>

          {selectedMonthlyIndex !== null && (
            <div className="absolute bg-[#0c162d]/95 border border-[#00d4ff]/50 rounded-xl p-2.5 shadow-2xl text-[9px] font-mono text-white pointer-events-auto z-50 flex flex-col gap-1" style={{ left: `${((monthlyCoords[selectedMonthlyIndex].x + 15) / 450) * 100}%`, top: `${((monthlyCoords[selectedMonthlyIndex].y - 15) / 160) * 100}%`, transform: 'translate(-50%, -100%)', width: '140px' }}>
              <div className="flex items-center justify-between border-b border-[#3c494e]/30 pb-1 mb-1">
                <span className="font-bold text-[#859398]">{monthlyData[selectedMonthlyIndex].fullMonth}</span>
                <button onClick={(e) => { e.stopPropagation(); setSelectedMonthlyIndex(null); }} className="text-[#859398] hover:text-white font-bold px-1">×</button>
              </div>
              <div className="flex flex-col">
                <span className="text-[#859398] text-[8px] uppercase">Volumen mensual</span>
                <span className="text-[#00d4ff] text-xs font-extrabold font-mono">{monthlyData[selectedMonthlyIndex].val.toLocaleString("es-CL")} m³</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. GRÁFICO 4: Volumen Acumulado Anual con Tooltip */}
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
              const barColor = isSelected ? "#00d4ff" : "#1b2d4f";

              return (
                <g key={idx} onClick={() => setSelectedAnualIndex(idx)} className="cursor-pointer">
                  {/* Invisible broad tap target for mobile touch reliability */}
                  <rect x={x - 20} y={10} width="75" height="130" fill="transparent" pointerEvents="all" />

                  <rect x={x} y={20} width="35" height="110" fill="#060e20" rx="4" opacity="0.4" />
                  <rect x={x} y={y} width="35" height={barHeight} fill={barColor} rx="4" className="hover:fill-[#00d4ff]/80 transition-colors" style={{ filter: isSelected ? "drop-shadow(0px 0px 4px rgba(0, 212, 255, 0.6))" : "none" }} />
                  <text x={x + 17.5} y="148" fill={isSelected ? "#00d4ff" : "#859398"} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight={isSelected ? "bold" : "normal"}>{item.year}</text>
                </g>
              );
            })}
          </svg>

          {selectedAnualIndex !== null && (
            <div className="absolute bg-[#0c162d]/95 border border-[#00d4ff]/50 rounded-xl p-2.5 shadow-2xl text-[9px] font-mono text-white pointer-events-auto z-50 flex flex-col gap-1" style={{ left: `${((anualCoords[selectedAnualIndex].x + 17.5) / 450) * 100}%`, top: `${((anualCoords[selectedAnualIndex].y - 15) / 160) * 100}%`, transform: 'translate(-50%, -100%)', width: '140px' }}>
              <div className="flex items-center justify-between border-b border-[#3c494e]/30 pb-1 mb-1">
                <span className="font-bold text-[#859398]">{anualData[selectedAnualIndex].fullYear}</span>
                <button onClick={(e) => { e.stopPropagation(); setSelectedAnualIndex(null); }} className="text-[#859398] hover:text-white font-bold px-1">×</button>
              </div>
              <div className="flex flex-col">
                <span className="text-[#859398] text-[8px] uppercase">Volumen anual</span>
                <span className="text-[#00d4ff] text-xs font-extrabold font-mono">{anualData[selectedAnualIndex].val.toLocaleString("es-CL")} m³</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. MODAL DE PANTALLA COMPLETA */}
      {isFullscreen && (
        <div 
          onClick={() => setHoveredLineIndex(null)}
          className="fixed inset-0 z-50 bg-[#0b1326] flex flex-col p-5 md:p-8 animate-fade-in overflow-y-auto"
        >
          <div 
            onClick={() => setHoveredLineIndex(null)}
            className="max-w-md mx-auto w-full flex-1 flex flex-col justify-between min-h-full"
          >
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-[#3c494e]/20 pb-3" onClick={(e) => e.stopPropagation()}>
              <div>
                <span className="text-[9px] font-bold text-[#00d4ff] tracking-widest uppercase block">
                  VISTA DETALLADA
                </span>
                <h2 className="text-sm font-extrabold text-white tracking-wide font-sora mt-0.5">
                  Gráfico Dinámico — {selectedWell === "Todos" ? "Todos los Pozos" : selectedWell}
                </h2>
              </div>
              <button
                onClick={() => {
                  setHoveredLineIndex(null);
                  setIsFullscreenDatePickerOpen(false);
                  setIsFullscreen(false);
                }}
                className="p-2 bg-[#171f33]/80 border border-[#3c494e]/30 rounded-xl text-[#dae2fd] hover:text-white transition-all active:scale-95 outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FILTROS EN PANTALLA COMPLETA */}
            <div className="flex flex-col gap-2 py-3 border-b border-[#3c494e]/20" onClick={(e) => e.stopPropagation()}>
              {/* Rango de Fechas Global */}
              <div className="flex flex-col gap-1" ref={fullscreenPopoverRef}>
                <label className="text-[8px] font-bold text-[#859398] tracking-widest uppercase">
                  Rango Global de Tiempo
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsFullscreenDatePickerOpen(!isFullscreenDatePickerOpen)}
                    className="w-full pl-3 pr-8 py-2 bg-[#060e20]/60 border border-[#3c494e]/30 text-[11px] rounded-xl text-left font-bold text-[#dae2fd] flex items-center justify-between outline-none"
                  >
                    <span className="truncate">{displayRangeText}</span>
                    <Calendar className="w-3.5 h-3.5 text-[#859398]" />
                  </button>

                  {/* Popover del Rango */}
                  {isFullscreenDatePickerOpen && (
                    <div className="absolute left-0 right-0 mt-2 p-3 bg-[#0c162d] border border-[#3c494e]/50 rounded-2xl shadow-2xl z-50 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-1.5">
                        {["Últimas 24 horas", "Última semana", "Último mes", "Últimos 6 meses", "Último año"].map((p) => (
                          <button
                            key={p}
                            onClick={() => handlePresetClick(p)}
                            className={`py-1.5 px-1.5 text-[8.5px] rounded-lg border text-center font-bold transition-all ${
                              tempPreset === p
                                ? "bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]"
                                : "bg-[#171f33]/40 border-[#3c494e]/20 text-[#859398] hover:border-[#859398]/40"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1.5 border-t border-[#3c494e]/20 pt-2">
                        <span className="text-[8px] font-bold text-[#859398] uppercase tracking-wider">
                          Rango Personalizado
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[7.5px] text-[#859398] uppercase">Desde</label>
                            <input
                              type="date"
                              value={tempStartDate}
                              onChange={(e) => {
                                setTempStartDate(e.target.value);
                                setTempPreset("Personalizado");
                              }}
                              className="bg-[#060e20] border border-[#3c494e]/30 rounded-lg p-1.5 text-[9.5px] text-white outline-none focus:border-[#00d4ff]"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[7.5px] text-[#859398] uppercase">Hasta</label>
                            <input
                              type="date"
                              value={tempEndDate}
                              onChange={(e) => {
                                setTempEndDate(e.target.value);
                                setTempPreset("Personalizado");
                              }}
                              className="bg-[#060e20] border border-[#3c494e]/30 rounded-lg p-1.5 text-[9.5px] text-white outline-none focus:border-[#00d4ff]"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={applyCustomRange}
                        className="w-full py-1.5 bg-[#00d4ff] hover:bg-[#00b4d8] text-[#060e20] font-bold text-[10px] rounded-xl transition-all"
                      >
                        Aplicar Rango
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Selector de Pozo */}
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-bold text-[#859398] tracking-widest uppercase">
                  Selección de Pozo
                </label>
                <div className="relative">
                  <select
                    value={selectedWell}
                    onChange={(e) => setSelectedWell(e.target.value)}
                    className="w-full glass-input px-3 py-2 bg-[#060e20]/60 border border-[#3c494e]/30 text-[11px] rounded-xl appearance-none cursor-pointer font-bold text-white outline-none"
                  >
                    <option value="Todos">Todos los Pozos (Consolidador)</option>
                    {MOCK_WELLS.map((well) => (
                      <option key={well.id} value={well.name}>
                        {well.name} {well.status === "inactive" ? "(APAGADO)" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#859398]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Área del Gráfico Escalado */}
            <div className="flex-1 flex flex-col justify-center items-center my-4 relative min-h-0 w-full">
              <div className="w-full max-h-[70vh] flex items-center justify-center relative">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-auto select-none cursor-crosshair max-w-lg"
                  onMouseMove={handleLineInteraction}
                  onTouchStart={handleLineInteraction}
                  onTouchMove={handleLineInteraction}
                  onClick={handleSvgClick}
                  onMouseLeave={() => setHoveredLineIndex(null)}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Grid horizontal lines */}
                  <line x1={padding.left} y1={20} x2={width - padding.right} y2={20} stroke="#3c494e" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15" />
                  <line x1={padding.left} y1={95} x2={width - padding.right} y2={95} stroke="#3c494e" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15" />
                  <line x1={padding.left} y1={170} x2={width - padding.right} y2={170} stroke="#3c494e" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15" />

                  {/* Ejes */}
                  <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#3c494e" strokeWidth="1" opacity="0.6" />
                  <line x1={width - padding.right} y1={padding.top} x2={width - padding.right} y2={height - padding.bottom} stroke="#3c494e" strokeWidth="1" opacity="0.6" />
                  <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#3c494e" strokeWidth="1" opacity="0.6" />

                  {/* Ticks Izquierda (Caudal L/s - Cyan) */}
                  <text x={padding.left - 6} y={23} fill="#00d4ff" fontSize="7.5" textAnchor="end" fontFamily="monospace" fontWeight="bold">
                    {lineChartCoords.maxC.toFixed(1)} L/s
                  </text>
                  <text x={padding.left - 6} y={98} fill="#00d4ff" fontSize="7.5" textAnchor="end" fontFamily="monospace">
                    {((lineChartCoords.maxC + lineChartCoords.minC) / 2).toFixed(1)}
                  </text>
                  <text x={padding.left - 6} y={173} fill="#00d4ff" fontSize="7.5" textAnchor="end" fontFamily="monospace">
                    {lineChartCoords.minC.toFixed(1)}
                  </text>

                  {/* Ticks Derecha (Nivel m - Yellow) */}
                  <text x={width - padding.right + 6} y={23} fill="#ffcd56" fontSize="7.5" textAnchor="start" fontFamily="monospace" fontWeight="bold">
                    {lineChartCoords.maxN.toFixed(1)} m
                  </text>
                  <text x={width - padding.right + 6} y={98} fill="#ffcd56" fontSize="7.5" textAnchor="start" fontFamily="monospace">
                    {((lineChartCoords.maxN + lineChartCoords.minN) / 2).toFixed(1)}
                  </text>
                  <text x={width - padding.right + 6} y={173} fill="#ffcd56" fontSize="7.5" textAnchor="start" fontFamily="monospace">
                    {lineChartCoords.minN.toFixed(1)}
                  </text>

                  {/* Ticks Eje X (Fechas con mayor densidad en pantalla completa) */}
                  {lineChartData.map((item, idx) => {
                    const x = lineChartCoords.getXCoord(idx);
                    let showLabel = true;
                    if (lineChartData.length > 15) {
                      showLabel = idx % 3 === 0; // Mostrar cada 3 horas en pantalla completa
                    }
                    if (!showLabel) return null;
                    return (
                      <text key={idx} x={x} y={height - padding.bottom + 14} fill="#859398" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                        {item.label}
                      </text>
                    );
                  })}

                  {/* Paths de los datos */}
                  <path d={lineChartCoords.caudalPath} fill="none" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(0,212,255,0.4)]" />
                  <path d={lineChartCoords.nivelPath} fill="none" stroke="#ffcd56" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(255,205,86,0.4)]" />
                  <path d={lineChartCoords.totalizadorPath} fill="none" stroke="#859398" strokeWidth="2.0" strokeLinecap="round" strokeDasharray="3 3" />

                  {/* Línea vertical de guía interacción */}
                  {hoveredLineIndex !== null && (
                    <line x1={lineChartCoords.getXCoord(hoveredLineIndex)} y1={padding.top} x2={lineChartCoords.getXCoord(hoveredLineIndex)} y2={height - padding.bottom} stroke="rgba(0, 212, 255, 0.5)" strokeWidth="2" strokeDasharray="3 3" />
                  )}
                </svg>

                {/* Tooltip de 3 parámetros flotante */}
                {hoveredLineIndex !== null && (
                  <div onClick={(e) => e.stopPropagation()} className="absolute bg-[#0c162d]/95 border border-[#00d4ff]/40 rounded-xl p-3 shadow-2xl text-[9px] pointer-events-none z-50 w-[170px]" style={{ left: `${(lineTooltipPos.x / 450) * 100}%`, top: `${((lineTooltipPos.y - 15) / height) * 100}%`, transform: 'translate(-50%, -100%)' }}>
                    <span className="font-bold text-[#859398] border-b border-[#3c494e]/30 pb-1 mb-1 block">{lineChartData[hoveredLineIndex].fullLabel}</span>
                    <div className="flex justify-between"><span className="text-[#ffcd56]">Nivel:</span><span className="font-bold">{lineChartData[hoveredLineIndex].nivel.toFixed(1)} m</span></div>
                    <div className="flex justify-between"><span className="text-[#00d4ff]">Caudal:</span><span className="font-bold">{lineChartData[hoveredLineIndex].caudal.toFixed(1)} L/s</span></div>
                    <div className="flex justify-between"><span className="text-[#a0aec0]">Totalizador:</span><span className="font-bold text-white">{lineChartData[hoveredLineIndex].totalizador.toLocaleString("es-CL")} m³</span></div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Leyenda y Detalles del Punto inferior */}
            <div className="border-t border-[#3c494e]/20 pt-4 flex flex-col gap-4">
              {/* Leyenda */}
              <div className="flex items-center justify-center gap-6 text-[10px] text-[#859398] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#00d4ff]"></span>
                  <span>Caudal (L/s)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#ffcd56]"></span>
                  <span>Nivel (m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#859398]"></span>
                  <span>Totalizador (m³)</span>
                </div>
              </div>

              {/* Panel de Valores */}
              <div className="glass-card p-4 border border-[#3c494e]/30 bg-[#171f33]/40">
                {hoveredLineIndex !== null ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[#3c494e]/20 pb-2">
                      <span className="text-[10px] text-[#859398] font-bold uppercase tracking-wider">Lectura del Punto</span>
                      <span className="text-[10px] text-white font-bold">{lineChartData[hoveredLineIndex].fullLabel}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-[#859398] uppercase font-bold tracking-wider">Caudal</span>
                        <span className="text-lg font-extrabold text-[#00d4ff] leading-none mt-1">
                          {lineChartData[hoveredLineIndex].caudal.toFixed(1)} <span className="text-[9px] font-normal">L/s</span>
                        </span>
                      </div>
                      <div className="flex flex-col border-x border-[#3c494e]/20">
                        <span className="text-[8px] text-[#859398] uppercase font-bold tracking-wider">Nivel Freático</span>
                        <span className="text-lg font-extrabold text-[#ffcd56] leading-none mt-1">
                          {lineChartData[hoveredLineIndex].nivel.toFixed(1)} <span className="text-[9px] font-normal">m</span>
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-[#859398] uppercase font-bold tracking-wider">Totalizador</span>
                        <span className="text-lg font-extrabold text-white leading-none mt-1">
                          {lineChartData[hoveredLineIndex].totalizador.toLocaleString("es-CL")} <span className="text-[9px] font-normal font-mono">m³</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-[#859398] text-[10px] font-medium flex items-center justify-center gap-2">
                    <Info className="w-4 h-4 text-[#00d4ff] animate-pulse" />
                    <span>Deslice o pase el cursor sobre el gráfico para ver los valores en detalle</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
