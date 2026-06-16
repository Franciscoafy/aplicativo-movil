import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  status?: "normal" | "warning" | "critical";
  description?: string;
}

export default function MetricCard({
  label,
  value,
  unit,
  trend,
  status = "normal",
  description,
}: MetricCardProps) {
  
  // Asignamos colores según el estado
  const statusColors = {
    normal: {
      text: "text-status-normal glow-green",
      bg: "bg-status-normal/10 border-status-normal/20",
      pulse: "bg-status-normal shadow-glow-green",
    },
    warning: {
      text: "text-status-warning glow-gold",
      bg: "bg-status-warning/10 border-status-warning/20",
      pulse: "bg-status-warning",
    },
    critical: {
      text: "text-status-critical glow-red",
      bg: "bg-status-critical/10 border-status-critical/20",
      pulse: "bg-status-critical pulse-critical",
    },
  };

  const currentStatus = statusColors[status] || statusColors.normal;

  return (
    <div className="glass-card p-4 flex flex-col justify-between border border-white/10 hover:border-primary/30 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-outline tracking-wider uppercase font-hanken">
            {label}
          </span>
          
          {/* Indicador de tendencia o estado */}
          <div className="flex items-center gap-1">
            {trend === "up" && (
              <span className="p-1 rounded bg-white/5 text-primary">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            )}
            {trend === "down" && (
              <span className="p-1 rounded bg-white/5 text-status-critical">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </span>
            )}
            {trend === "stable" && (
              <span className="p-1 rounded bg-white/5 text-outline">
                <Minus className="w-3.5 h-3.5" />
              </span>
            )}
            <span className={`w-2 h-2 rounded-full ${currentStatus.pulse}`}></span>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${currentStatus.text}`}>
            {value}
          </span>
          {unit && (
            <span className="text-xs text-outline font-medium font-sans">
              {unit}
            </span>
          )}
        </div>
      </div>

      {description && (
        <div className="mt-3 pt-2 border-t border-border/40">
          <p className="text-[11px] text-outline leading-tight">{description}</p>
        </div>
      )}
    </div>
  );
}
