"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  FolderKanban, 
  Calendar, 
  RefreshCw, 
  BarChart3, 
  Droplet, 
  Timer, 
  Info,
  ChevronDown,
  Check
} from "lucide-react";

// Mock Data para simular la reactividad al seleccionar distintos proyectos
const PROJECT_MOCK_DATA: Record<string, {
  workedHours: { month: string; worked: number; exceeded: number }[];
  rightsConsumed: { month: string; percentage: number }[];
  recoveryTable: { period: string; trp: string; tep: string }[];
  evolutionChart: { date: string; fullDate: string; trp: number; tep: number }[];
}> = {
  "P12": {
    workedHours: [
      { month: "2026-05", worked: 232, exceeded: 158 },
      { month: "2026-04", worked: 270, exceeded: 162 },
      { month: "2026-03", worked: 228, exceeded: 134 },
      { month: "2026-02", worked: 242, exceeded: 128 },
    ],
    rightsConsumed: [
      { month: "2026-05", percentage: 232 },
      { month: "2026-04", percentage: 73.4 },
      { month: "2026-03", percentage: 43.1 },
      { month: "2026-02", percentage: 88.3 },
    ],
    recoveryTable: [
      { period: "2026-05", trp: "00:02", tep: "00:08" },
      { period: "2026-04", trp: "00:01", tep: "00:10" },
      { period: "2026-03", trp: "00:01", tep: "00:09" },
    ],
    evolutionChart: [
      { date: "12/17", fullDate: "2025-12-17", trp: 4, tep: 10 },
      { date: "01/04", fullDate: "2026-01-04", trp: 8, tep: 13 },
      { date: "01/21", fullDate: "2026-01-21", trp: 5, tep: 11 },
      { date: "02/27", fullDate: "2026-02-27", trp: 6, tep: 12 },
      { date: "03/26", fullDate: "2026-03-26", trp: 7, tep: 9 },
      { date: "04/13", fullDate: "2026-04-13", trp: 9, tep: 15 },
      { date: "05/01", fullDate: "2026-05-01", trp: 11, tep: 13 },
      { date: "05/15", fullDate: "2026-05-15", trp: 13, tep: 16 }
    ]
  },
  "P17": {
    workedHours: [
      { month: "2026-05", worked: 180, exceeded: 90 },
      { month: "2026-04", worked: 210, exceeded: 110 },
      { month: "2026-03", worked: 195, exceeded: 85 },
      { month: "2026-02", worked: 160, exceeded: 70 },
    ],
    rightsConsumed: [
      { month: "2026-05", percentage: 115 },
      { month: "2026-04", percentage: 65.2 },
      { month: "2026-03", percentage: 52.8 },
      { month: "2026-02", percentage: 41.5 },
    ],
    recoveryTable: [
      { period: "2026-05", trp: "00:03", tep: "00:07" },
      { period: "2026-04", trp: "00:02", tep: "00:09" },
      { period: "2026-03", trp: "00:01", tep: "00:08" },
    ],
    evolutionChart: [
      { date: "12/17", fullDate: "2025-12-17", trp: 5, tep: 9 },
      { date: "01/04", fullDate: "2026-01-04", trp: 6, tep: 11 },
      { date: "01/21", fullDate: "2026-01-21", trp: 4, tep: 10 },
      { date: "02/27", fullDate: "2026-02-27", trp: 5, tep: 8 },
      { date: "03/26", fullDate: "2026-03-26", trp: 6, tep: 12 },
      { date: "04/13", fullDate: "2026-04-13", trp: 8, tep: 14 },
      { date: "05/01", fullDate: "2026-05-01", trp: 10, tep: 11 },
      { date: "05/15", fullDate: "2026-05-15", trp: 11, tep: 12 }
    ]
  },
  "P22": {
    workedHours: [
      { month: "2026-05", worked: 310, exceeded: 220 },
      { month: "2026-04", worked: 290, exceeded: 195 },
      { month: "2026-03", worked: 320, exceeded: 240 },
      { month: "2026-02", worked: 280, exceeded: 180 },
    ],
    rightsConsumed: [
      { month: "2026-05", percentage: 310 },
      { month: "2026-04", percentage: 145.5 },
      { month: "2026-03", percentage: 98.4 },
      { month: "2026-02", percentage: 84.2 },
    ],
    recoveryTable: [
      { period: "2026-05", trp: "00:05", tep: "00:12" },
      { period: "2026-04", trp: "00:04", tep: "00:15" },
      { period: "2026-03", trp: "00:04", tep: "00:13" },
    ],
    evolutionChart: [
      { date: "12/17", fullDate: "2025-12-17", trp: 12, tep: 18 },
      { date: "01/04", fullDate: "2026-01-04", trp: 14, tep: 22 },
      { date: "01/21", fullDate: "2026-01-21", trp: 11, tep: 19 },
      { date: "02/27", fullDate: "2026-02-27", trp: 13, tep: 20 },
      { date: "03/26", fullDate: "2026-03-26", trp: 15, tep: 17 },
      { date: "04/13", fullDate: "2026-04-13", trp: 17, tep: 25 },
      { date: "05/01", fullDate: "2026-05-01", trp: 19, tep: 23 },
      { date: "05/15", fullDate: "2026-05-15", trp: 21, tep: 26 }
    ]
  },
  "P5": {
    workedHours: [
      { month: "2026-05", worked: 95, exceeded: 20 },
      { month: "2026-04", worked: 110, exceeded: 35 },
      { month: "2026-03", worked: 85, exceeded: 15 },
      { month: "2026-02", worked: 90, exceeded: 10 },
    ],
    rightsConsumed: [
      { month: "2026-05", percentage: 48 },
      { month: "2026-04", percentage: 35.1 },
      { month: "2026-03", percentage: 22.4 },
      { month: "2026-02", percentage: 18.0 },
    ],
    recoveryTable: [
      { period: "2026-05", trp: "00:01", tep: "00:04" },
      { period: "2026-04", trp: "00:01", tep: "00:05" },
      { period: "2026-03", trp: "00:01", tep: "00:04" },
    ],
    evolutionChart: [
      { date: "12/17", fullDate: "2025-12-17", trp: 2, tep: 5 },
      { date: "01/04", fullDate: "2026-01-04", trp: 3, tep: 7 },
      { date: "01/21", fullDate: "2026-01-21", trp: 2, tep: 6 },
      { date: "02/27", fullDate: "2026-02-27", trp: 2, tep: 5 },
      { date: "03/26", fullDate: "2026-03-26", trp: 3, tep: 4 },
      { date: "04/13", fullDate: "2026-04-13", trp: 4, tep: 8 },
      { date: "05/01", fullDate: "2026-05-01", trp: 5, tep: 6 },
      { date: "05/15", fullDate: "2026-05-15", trp: 6, tep: 7 }
    ]
  }
};

export default function ProyectosPage() {
  const [selectedProject, setSelectedProject] = useState("P12");
  const [updating, setUpdating] = useState(false);

  // Estados de Rango de Fechas
  const [startDate, setStartDate] = useState("2025-12-16");
  const [endDate, setEndDate] = useState("2026-06-16");
  const [preset, setPreset] = useState("Últimos 6 meses");

  // Estados temporales del popover del calendario
  const [tempStartDate, setTempStartDate] = useState("2025-12-16");
  const [tempEndDate, setTempEndDate] = useState("2026-06-16");
  const [tempPreset, setTempPreset] = useState("Últimos 6 meses");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

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

  // Calcular fechas al seleccionar presets
  const handlePresetClick = (selectedPreset: string) => {
    setTempPreset(selectedPreset);
    if (selectedPreset !== "Personalizado") {
      const end = new Date("2026-06-16");
      const start = new Date("2026-06-16");
      
      if (selectedPreset === "Último mes") {
        start.setMonth(start.getMonth() - 1);
      } else if (selectedPreset === "Últimos 3 meses") {
        start.setMonth(start.getMonth() - 3);
      } else if (selectedPreset === "Últimos 6 meses") {
        start.setMonth(start.getMonth() - 6);
      } else if (selectedPreset === "Último año") {
        start.setFullYear(start.getFullYear() - 1);
      }
      
      setTempStartDate(start.toISOString().split("T")[0]);
      setTempEndDate(end.toISOString().split("T")[0]);
    }
  };

  const applyCustomRange = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPreset(tempPreset);
    setIsDatePickerOpen(false);
  };

  const handleUpdate = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
    }, 600);
  };

  const activeData = useMemo(() => {
    return PROJECT_MOCK_DATA[selectedProject] || PROJECT_MOCK_DATA["P12"];
  }, [selectedProject]);

  // Filtro de meses para Gráficos de barras y Tabla (Formato YYYY-MM)
  const isMonthInRange = (monthStr: string) => {
    const [y, m] = monthStr.split("-").map(Number);
    const itemStart = new Date(y, m - 1, 1);
    const itemEnd = new Date(y, m, 0); // último día del mes
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);
    return itemStart <= rangeEnd && itemEnd >= rangeStart;
  };

  // Filtro de fechas para Gráfico de líneas (Formato YYYY-MM-DD)
  const isDateInRange = (dateStr: string) => {
    const itemDate = new Date(dateStr);
    const start = new Date(startDate);
    const end = new Date(endDate);
    itemDate.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return itemDate >= start && itemDate <= end;
  };

  // Filtrado de datos reactivo
  const filteredWorkedHours = useMemo(() => {
    return activeData.workedHours.filter(item => isMonthInRange(item.month));
  }, [activeData.workedHours, startDate, endDate]);

  const filteredRightsConsumed = useMemo(() => {
    return activeData.rightsConsumed.filter(item => isMonthInRange(item.month));
  }, [activeData.rightsConsumed, startDate, endDate]);

  const filteredRecoveryTable = useMemo(() => {
    return activeData.recoveryTable.filter(item => isMonthInRange(item.period));
  }, [activeData.recoveryTable, startDate, endDate]);

  const filteredEvolutionChart = useMemo(() => {
    return activeData.evolutionChart.filter(item => isDateInRange(item.fullDate));
  }, [activeData.evolutionChart, startDate, endDate]);

  // Promedio General del % de Derecho Consumido de forma dinámica
  const generalPercentageAverage = useMemo(() => {
    if (filteredRightsConsumed.length === 0) return 0;
    const percentages = filteredRightsConsumed.map(r => r.percentage);
    const sum = percentages.reduce((a, b) => a + b, 0);
    return Math.round(sum / percentages.length);
  }, [filteredRightsConsumed]);

  // Promedio de TRP y TEP en segundos/minutos de forma dinámica
  const tableAverages = useMemo(() => {
    if (filteredRecoveryTable.length === 0) return { trp: "00:00", tep: "00:00" };

    const timeToSeconds = (timeStr: string) => {
      const [m, s] = timeStr.split(":").map(Number);
      return m * 60 + s;
    };

    const secondsToTime = (totalSecs: number) => {
      const m = Math.floor(totalSecs / 60);
      const s = Math.round(totalSecs % 60);
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const trps = filteredRecoveryTable.map(r => timeToSeconds(r.trp));
    const teps = filteredRecoveryTable.map(r => timeToSeconds(r.tep));

    const avgTrp = trps.reduce((a, b) => a + b, 0) / trps.length;
    const avgTep = teps.reduce((a, b) => a + b, 0) / teps.length;

    return {
      trp: secondsToTime(avgTrp),
      tep: secondsToTime(avgTep)
    };
  }, [filteredRecoveryTable]);

  // Formatear texto visible del botón de rango
  const displayRangeText = useMemo(() => {
    const formatDateStr = (str: string) => {
      const parts = str.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    };
    if (preset === "Personalizado") {
      return `${formatDateStr(startDate)} - ${formatDateStr(endDate)}`;
    }
    return `${preset} (${formatDateStr(startDate)} - ${formatDateStr(endDate)})`;
  }, [startDate, endDate, preset]);

  // Dimensiones del gráfico de líneas SVG
  const width = 450;
  const height = 180;
  const padding = { top: 15, right: 15, bottom: 25, left: 35 };

  // Escalado para el gráfico de líneas (Evolución)
  const lineChartCoords = useMemo(() => {
    if (filteredEvolutionChart.length === 0) {
      return { trpPath: "", tepPath: "", getXCoord: () => 0, getYCoord: () => 0, maxY: 10 };
    }
    const trps = filteredEvolutionChart.map(c => c.trp);
    const teps = filteredEvolutionChart.map(c => c.tep);
    
    const minY = 0;
    const maxY = Math.max(...trps, ...teps) * 1.2 || 10;
    const maxX = filteredEvolutionChart.length - 1;

    const getXCoord = (index: number) => {
      if (maxX <= 0) return padding.left + (width - padding.left - padding.right) / 2;
      return padding.left + (index / maxX) * (width - padding.left - padding.right);
    };

    const getYCoord = (value: number) => {
      const scale = (value - minY) / (maxY - minY);
      return height - padding.bottom - scale * (height - padding.top - padding.bottom);
    };

    // Generar path para TRP (Tiempo de Recuperación - Celeste)
    let trpPath = `M ${getXCoord(0)} ${getYCoord(filteredEvolutionChart[0].trp)}`;
    for (let i = 0; i < filteredEvolutionChart.length - 1; i++) {
      const x1 = getXCoord(i);
      const y1 = getYCoord(filteredEvolutionChart[i].trp);
      const x2 = getXCoord(i + 1);
      const y2 = getYCoord(filteredEvolutionChart[i + 1].trp);
      
      const cpX1 = x1 + (x2 - x1) / 2;
      const cpY1 = y1;
      const cpX2 = x1 + (x2 - x1) / 2;
      const cpY2 = y2;
      
      trpPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`;
    }

    // Generar path para TEP (Tiempo de Estabilización - Verde)
    let tepPath = `M ${getXCoord(0)} ${getYCoord(filteredEvolutionChart[0].tep)}`;
    for (let i = 0; i < filteredEvolutionChart.length - 1; i++) {
      const x1 = getXCoord(i);
      const y1 = getYCoord(filteredEvolutionChart[i].tep);
      const x2 = getXCoord(i + 1);
      const y2 = getYCoord(filteredEvolutionChart[i + 1].tep);
      
      const cpX1 = x1 + (x2 - x1) / 2;
      const cpY1 = y1;
      const cpX2 = x1 + (x2 - x1) / 2;
      const cpY2 = y2;
  tepPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`;
    }

    return { trpPath, tepPath, getXCoord, getYCoord, maxY };
  }, [filteredEvolutionChart]);

  return (
    <div className="flex flex-col gap-5 font-mono max-w-md mx-auto bg-[#0b1326] text-white pb-6 relative">
      
      {/* 1. FILTROS DE CABECERA - STICKY ON SCROLL */}
      <div className="sticky top-0 bg-[#0b1326]/95 backdrop-blur-md z-40 py-3 px-2 border-b border-[#3c494e]/20 flex flex-col gap-2.5 shadow-lg">
        {/* Selector de Proyecto */}
        <div className="flex flex-col gap-1 px-1">
          <label className="text-[9px] font-bold text-[#859398] tracking-widest uppercase">
            Vista de Proyecto
          </label>
          <div className="relative">
            <select
              id="proj-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 bg-[#060e20]/60 border border-[#3c494e]/30 text-xs rounded-xl appearance-none cursor-pointer font-bold text-white outline-none"
            >
              <option value="P12">Proyecto P12</option>
              <option value="P17">Proyecto P17</option>
              <option value="P22">Proyecto P22</option>
              <option value="P5">Proyecto P5</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#859398]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Rango de Fechas Tipo Popover */}
        <div className="flex flex-col gap-1 px-1" ref={popoverRef}>
          <label className="text-[9px] font-bold text-[#859398] tracking-widest uppercase">
            Rango de Fechas
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full pl-3.5 pr-10 py-2.5 bg-[#060e20]/60 border border-[#3c494e]/30 text-xs rounded-xl text-left font-bold text-[#dae2fd] flex items-center justify-between outline-none"
            >
              <span className="truncate">{displayRangeText}</span>
              <Calendar className="w-4 h-4 text-[#859398]" />
            </button>

            {/* Popover del Calendario */}
            {isDatePickerOpen && (
              <div className="absolute left-0 right-0 mt-2 p-4 bg-[#0c162d] border border-[#3c494e]/50 rounded-2xl shadow-2xl z-50 flex flex-col gap-4">
                {/* Grid de Presets */}
                <div className="grid grid-cols-2 gap-2">
                  {["Último mes", "Últimos 3 meses", "Últimos 6 meses", "Último año"].map((p) => (
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

                {/* Custom Inputs */}
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

                {/* Botón de Acción */}
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

        {/* Botón de Actualizar */}
        <button
          id="btn-update-projects"
          onClick={handleUpdate}
          disabled={updating}
          className="w-full py-2.5 px-4 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 font-bold text-[10px] tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 outline-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${updating ? "animate-spin" : ""}`} />
          ACTUALIZAR
        </button>
      </div>

      {/* 2. GRÁFICO 1: Horas Trabajadas vs Horas Excediendo Derecho */}
      <div className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-2 font-sora">
          <BarChart3 className="w-4 h-4 text-[#00d4ff]" />
          Horas trabajadas vs Horas Excediendo Derecho
        </h3>

        <div className="flex flex-col gap-4 pt-2">
          {filteredWorkedHours.length > 0 ? (
            filteredWorkedHours.map((item, idx) => {
              const maxVal = 350;
              const workedPct = (item.worked / maxVal) * 100;
              const exceededPct = (item.exceeded / maxVal) * 100;

              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-white font-mono">{item.month}</span>
                  
                  <div className="flex flex-col gap-1.5 pl-1">
                    {/* Horas Trabajadas */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-[#060e20] rounded overflow-hidden">
                        <div 
                          className="h-full bg-[#354a74] rounded-sm transition-all duration-500" 
                          style={{ width: `${workedPct}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-[#dae2fd] w-8 text-right font-mono">{item.worked}h</span>
                    </div>

                    {/* Horas Excediendo Derecho */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-[#060e20] rounded overflow-hidden">
                        <div 
                          className="h-full bg-[#2d2b54] rounded-sm transition-all duration-500" 
                          style={{ width: `${exceededPct}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-[#859398] w-8 text-right font-mono">{item.exceeded}h</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[10px] text-[#859398] text-center py-4 font-mono">No hay datos en el rango seleccionado.</p>
          )}
        </div>

        {/* Leyenda */}
        <div className="flex flex-col gap-1 mt-2 text-[9px] text-[#859398] pl-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#354a74] rounded-sm"></span>
            <span>H. Trabajadas (Prom)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#2d2b54] rounded-sm"></span>
            <span>H. Excediendo Derecho</span>
          </div>
        </div>
      </div>

      {/* 3. GRÁFICO 2: Porcentaje de Derecho Consumido */}
      <div className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-2 font-sora">
            <Droplet className="w-4 h-4 text-[#00f5d4]" />
            Porcentaje de Derecho Consumido
          </h3>
          <Info className="w-4 h-4 text-[#859398]" />
        </div>

        <div className="flex flex-col gap-4 pt-2">
          {filteredRightsConsumed.length > 0 ? (
            filteredRightsConsumed.map((item, idx) => {
              const barPct = Math.min(100, item.percentage);
              const isExceeded = item.percentage > 100;
              const barColor = isExceeded
                ? "bg-gradient-to-r from-[#ff3131]/80 to-[#ff3131] shadow-glow-red"
                : "bg-gradient-to-r from-[#00f5d4]/80 to-[#00f5d4] shadow-glow-green";

              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white font-mono">
                    <span>{item.month}</span>
                    <span className={isExceeded ? "text-[#ff3131]" : "text-[#00f5d4]"}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#060e20] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[10px] text-[#859398] text-center py-4 font-mono">No hay datos en el rango seleccionado.</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#3c494e]/10 text-xs font-bold text-white">
          <span>Promedio General:</span>
          <span className="text-[#00d4ff] text-base font-mono glow-cyan">{generalPercentageAverage}%</span>
        </div>
      </div>

      {/* 4. GRÁFICO 3: Tiempos de Recuperación y Estabilización (Tabla) */}
      <div className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-2 font-sora">
          <Timer className="w-4 h-4 text-[#c5c2f0]" />
          Tiempos de Recuperación y Estabilización
        </h3>

        <div className="overflow-x-auto mt-2">
          {filteredRecoveryTable.length > 0 ? (
            <table className="w-full text-left border-collapse text-[10px] font-mono text-[#859398]">
              <thead>
                <tr className="border-b border-[#3c494e]/20 text-[9px] uppercase tracking-wider">
                  <th className="py-2 font-semibold">Periodo</th>
                  <th className="py-2 text-center font-semibold">TRP (Prom)</th>
                  <th className="py-2 text-center font-semibold">TEP (Prom)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c494e]/10 text-white">
                {filteredRecoveryTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-bold">{row.period}</td>
                    <td className="py-2.5 text-center text-[#00d4ff] font-bold">{row.trp}</td>
                    <td className="py-2.5 text-center text-[#dae2fd] font-medium">{row.tep}</td>
                  </tr>
                ))}
                {/* Fila del Promedio */}
                <tr className="border-t border-[#3c494e]/30 bg-[#060e20]/40 font-bold">
                  <td className="py-2.5 pl-1">Promedio</td>
                  <td className="py-2.5 text-center text-[#00d4ff] font-mono">{tableAverages.trp}</td>
                  <td className="py-2.5 text-center text-[#00fea2] font-mono">{tableAverages.tep}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-[10px] text-[#859398] text-center py-4 font-mono">No hay datos en el rango seleccionado.</p>
          )}
        </div>
      </div>

      {/* 5. GRÁFICO 4: Evolución de Estabilización y Recuperación (Gráfico de Líneas) */}
      <div className="glass-card mx-2 p-4 border border-[#3c494e]/20 bg-[#171f33]/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white tracking-wide font-sora">
            Evolución de Estabilización y Recuperación
          </h3>
          {/* Leyenda */}
          <div className="flex gap-3 text-[8px] text-outline font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00d4ff]" />
              TRP
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00fea2]" />
              TEP
            </span>
          </div>
        </div>

        {/* Gráfico de dos líneas SVG */}
        <div className="w-full mt-2">
          {filteredEvolutionChart.length > 0 ? (
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cuadrícula Horizontal */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                const val = p * lineChartCoords.maxY;
                const y = lineChartCoords.getYCoord(val);
                return (
                  <line
                    key={idx}
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Eje X y Marcas */}
              {filteredEvolutionChart.map((point, idx) => {
                const xCoord = lineChartCoords.getXCoord(idx);
                return (
                  <g key={idx}>
                    <text
                      x={xCoord}
                      y={height - padding.bottom + 14}
                      fill="#859398"
                      fontSize="8"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {point.date}
                    </text>
                    <line
                      x1={xCoord}
                      y1={height - padding.bottom}
                      x2={xCoord}
                      y2={height - padding.bottom + 4}
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Línea TEP (Verde) */}
              {lineChartCoords.tepPath && (
                <path
                  d={lineChartCoords.tepPath}
                  fill="none"
                  stroke="#00fea2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_4px_rgba(0,254,162,0.4)]"
                />
              )}

              {/* Puntos TEP */}
              {filteredEvolutionChart.map((point, idx) => {
                const x = lineChartCoords.getXCoord(idx);
                const y = lineChartCoords.getYCoord(point.tep);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#00fea2"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                  />
                );
              })}

              {/* Línea TRP (Celeste) */}
              {lineChartCoords.trpPath && (
                <path
                  d={lineChartCoords.trpPath}
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_4px_rgba(0,212,255,0.4)]"
                />
              )}

              {/* Puntos TRP */}
              {filteredEvolutionChart.map((point, idx) => {
                const x = lineChartCoords.getXCoord(idx);
                const y = lineChartCoords.getYCoord(point.trp);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#00d4ff"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                  />
                );
              })}
            </svg>
          ) : (
            <p className="text-[10px] text-[#859398] text-center py-6 font-mono">No hay datos de evolución en el rango seleccionado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
