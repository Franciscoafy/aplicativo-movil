"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface DateRangeSelectorProps {
  fromDate: string;
  toDate: string;
  onFromChange: (date: string) => void;
  onToChange: (date: string) => void;
}

export default function DateRangeSelector({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
}: DateRangeSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-semibold text-outline uppercase tracking-wider font-hanken flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5 text-primary" />
        Rango de Fechas
      </label>
      
      <div className="flex gap-2 w-full">
        {/* Fecha Desde */}
        <div className="flex-1 relative">
          <input
            id="input-date-from"
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full glass-input px-3 py-2 bg-surface-container-low text-xs rounded-xl focus:border-primary border border-border text-white dark:[color-scheme:dark]"
          />
        </div>

        {/* Fecha Hasta */}
        <div className="flex-1 relative">
          <input
            id="input-date-to"
            type="date"
            value={toDate}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full glass-input px-3 py-2 bg-surface-container-low text-xs rounded-xl focus:border-primary border border-border text-white dark:[color-scheme:dark]"
          />
        </div>
      </div>
    </div>
  );
}
