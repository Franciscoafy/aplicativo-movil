"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface WellSelectorProps {
  wells: string[];
  selectedWell: string;
  onChange: (well: string) => void;
}

export default function WellSelector({
  wells,
  selectedWell,
  onChange,
}: WellSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-semibold text-outline uppercase tracking-wider font-hanken flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        Identificador Pozo (CASUB)
      </label>
      
      <div className="relative">
        <select
          id="select-well"
          value={selectedWell}
          onChange={(e) => onChange(e.target.value)}
          className="w-full glass-input px-3 py-2.5 bg-surface-container-low text-sm rounded-xl appearance-none cursor-pointer focus:border-primary border border-border"
        >
          <option value="">Todos los Pozos</option>
          {wells.map((well) => (
            <option key={well} value={well} className="bg-surface-container-high text-white">
              Pozo {well}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-outline">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
