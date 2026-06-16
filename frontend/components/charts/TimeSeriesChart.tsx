"use client";

import React, { useMemo } from "react";

interface DataPoint {
  timestamp: string;
  value: number;
}

interface TimeSeriesChartProps {
  data: DataPoint[];
  yLabel?: string;
  limitLine?: number; // Línea de advertencia/límite DGA
}

export default function TimeSeriesChart({
  data,
  yLabel = "L/s",
  limitLine,
}: TimeSeriesChartProps) {
  
  // Si no hay datos, mostramos un estado vacío
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-outline bg-surface-container-low/40 rounded-xl border border-border">
        No hay datos para mostrar
      </div>
    );
  }

  // Dimensiones del gráfico SVG
  const width = 500;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };

  // Calculamos los valores mínimos y máximos para el escalado
  const xCoords = useMemo(() => data.map((_, idx) => idx), [data]);
  const yValues = useMemo(() => data.map((d) => d.value), [data]);

  const minX = 0;
  const maxX = data.length - 1;
  
  const minY = 0;
  const maxY = useMemo(() => {
    const maxVal = Math.max(...yValues, limitLine || 0);
    return maxVal * 1.2 || 10; // Dejamos un 20% de margen arriba
  }, [yValues, limitLine]);

  // Funciones de escalado para transformar coordenadas de datos a pixeles SVG
  const getX = (index: number) => {
    return padding.left + (index / maxX) * (width - padding.left - padding.right);
  };

  const getY = (value: number) => {
    const scale = (value - minY) / (maxY - minY);
    return height - padding.bottom - scale * (height - padding.top - padding.bottom);
  };

  // Generamos el camino (path) de la línea usando curvas Bezier para suavizarla
  const linePath = useMemo(() => {
    if (data.length === 0) return "";
    
    let path = `M ${getX(0)} ${getY(data[0].value)}`;
    
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = getX(i);
      const y1 = getY(data[i].value);
      const x2 = getX(i + 1);
      const y2 = getY(data[i + 1].value);
      
      // Puntos de control para la curva bezier cúbica (suave)
      const cpX1 = x1 + (x2 - x1) / 2;
      const cpY1 = y1;
      const cpX2 = x1 + (x2 - x1) / 2;
      const cpY2 = y2;
      
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x2} ${y2}`;
    }
    return path;
  }, [data, minY, maxY]);

  // Generamos el camino del área sombreada debajo de la curva (gradiente)
  const areaPath = useMemo(() => {
    if (data.length === 0) return "";
    const startX = getX(0);
    const endX = getX(data.length - 1);
    const bottomY = height - padding.bottom;
    
    return `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  }, [linePath]);

  // Línea de límite regulatorio (si aplica)
  const limitY = limitLine !== undefined ? getY(limitLine) : null;

  // Filtramos etiquetas del eje X para no saturar la pantalla móvil
  const xLabels = useMemo(() => {
    const step = Math.ceil(data.length / 4);
    return data.filter((_, idx) => idx % step === 0 || idx === data.length - 1);
  }, [data]);

  return (
    <div className="w-full flex flex-col">
      {/* Contenedor responsivo SVG */}
      <div className="w-full overflow-hidden relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradiente para la línea de telemetría */}
            <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#00fea2" />
            </linearGradient>

            {/* Gradiente para el área sombreada con opacidad */}
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0b1326" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas de cuadrícula horizontal de fondo */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const val = minY + p * (maxY - minY);
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#859398"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Eje X y marcas temporales */}
          {data.map((point, idx) => {
            // Mostramos solo unas 4-5 etiquetas del eje X para no solapar en móvil
            const step = Math.ceil(data.length / 5);
            if (idx % step !== 0 && idx !== data.length - 1) return null;
            
            const x = getX(idx);
            const date = new Date(point.timestamp);
            const labelStr = `${date.getDate()}/${date.getMonth() + 1}`;

            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={height - padding.bottom}
                  x2={x}
                  y2={height - padding.bottom + 5}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  fill="#859398"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {labelStr}
                </text>
              </g>
            );
          })}

          {/* Área sombreada */}
          <path d={areaPath} fill="url(#chartAreaGrad)" />

          {/* Curva de Datos principal */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#chartLineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_6px_rgba(0,212,255,0.6)]"
          />

          {/* Línea de Límite regulatorio DGA */}
          {limitLine !== undefined && limitY !== null && (
            <g>
              <line
                x1={padding.left}
                y1={limitY}
                x2={width - padding.right}
                y2={limitY}
                stroke="#FF3131"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                className="drop-shadow-[0_0_3px_rgba(255,49,49,0.5)]"
              />
              <text
                x={width - padding.right}
                y={limitY - 5}
                fill="#FF3131"
                fontSize="8"
                fontWeight="bold"
                fontFamily="Sora"
                textAnchor="end"
              >
                LÍMITE DGA ({limitLine} {yLabel})
              </text>
            </g>
          )}

          {/* Puntos de datos individuales (como pequeños rombos/círculos brillantes) */}
          {data.map((point, idx) => {
            const x = getX(idx);
            const y = getY(point.value);
            const isAlert = limitLine !== undefined && point.value > limitLine;

            return (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={isAlert ? "#FF3131" : "#00d4ff"}
                  stroke="#ffffff"
                  strokeWidth="1"
                  className="transition-all duration-200 hover:r-5"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leyenda */}
      <div className="flex justify-center items-center gap-6 mt-2 text-[10px] font-mono text-outline">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 bg-gradient-to-r from-primary to-tertiary rounded"></span>
          <span>Caudal Medido ({yLabel})</span>
        </div>
        {limitLine !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-dashed border-status-critical"></span>
            <span>Límite Regulatorio DGA</span>
          </div>
        )}
      </div>
    </div>
  );
}
