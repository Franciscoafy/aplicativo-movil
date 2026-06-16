"use client";

import React, { useState } from "react";
import { Folder, Search, MapPin, Waves } from "lucide-react";

// Icono personalizado de sonda/sensor de pozo que imita la captura de pantalla
const ProbeIcon = () => (
  <svg className="w-5 h-5 text-[#00d4ff] shadow-glow-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4v16M12 4v16M16 4v16M8 9h8M8 15h8" />
  </svg>
);

const MOCK_DEVICES = [
  { type: "folder", name: "Campo Feliz Hijuela 4" },
  { type: "device", name: "CASUB - 0009", status: "active" },
  { type: "device", name: "CASUB - 0039", status: "active" },
  { type: "device", name: "CASUB - 0049", status: "active" },
  { type: "device", name: "CASUB - 0056", status: "active" },
  { type: "device", name: "CASUB - 0063", status: "active" },
  { type: "device", name: "CASUB - 0064", status: "inactive" },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDevices = MOCK_DEVICES.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 font-mono max-w-md mx-auto bg-[#0b1326] text-white">
      {/* 1. SECCIÓN SUPERIOR: Mapa de fondo con badges flotantes */}
      <div className="relative w-full h-56 rounded-2xl border border-[#3c494e]/30 overflow-hidden shadow-2xl bg-[#060e20]">
        
        {/* Simulación del mapa de fondo (efecto visual callejero nocturno) */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#0b1326_90%)]" />
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Rutas principales del mapa simulado */}
            <path d="M 0 50 Q 150 70 300 40 T 600 80" fill="none" stroke="#859398" strokeWidth="2" />
            <path d="M 50 0 Q 80 120 40 240" fill="none" stroke="#859398" strokeWidth="1.5" />
            <path d="M 200 0 C 220 100 180 150 220 240" fill="none" stroke="#859398" strokeWidth="1.5" />
            <path d="M 0 160 Q 200 130 500 180" fill="none" stroke="#859398" strokeWidth="1" />
            
            {/* Calles secundarias */}
            <line x1="10" y1="10" x2="150" y2="100" stroke="#859398" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="280" y1="20" x2="200" y2="180" stroke="#859398" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="120" y1="220" x2="380" y2="120" stroke="#859398" strokeWidth="0.5" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* Marcadores de pozos flotantes en el mapa */}
        <div className="absolute top-1/4 left-1/4 flex flex-col items-center animate-pulse">
          <div className="w-4 h-4 rounded-full bg-[#00fea2] border-2 border-white shadow-glow-green" />
        </div>
        <div className="absolute bottom-1/3 left-1/2 flex flex-col items-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#00d4ff] border-2 border-white shadow-glow-cyan" />
        </div>
        <div className="absolute top-1/2 right-1/3 flex flex-col items-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#ff3131] border-2 border-white shadow-glow-red animate-pulse" />
        </div>

        {/* Contenido flotante de cabecera */}
        <div className="absolute inset-x-0 top-3 flex justify-between px-3 z-10">
          {/* Badge Izquierdo: Sistema en línea */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b1326]/80 border border-[#3c494e]/30 backdrop-blur-md text-[10px] font-bold text-white tracking-widest">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00fea2] pulse-active"></span>
            SISTEMA EN LÍNEA
          </div>

          {/* Badge Derecho: Pozos Activos */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0b1326]/80 border border-[#3c494e]/30 backdrop-blur-md text-[10px] font-bold text-white tracking-wider">
            12 Pozos Activos
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN CENTRAL: Tarjetas de Dispositivos */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Dispositivos Activos */}
          <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#00d4ff]/10 bg-[#171f33]/40">
            <span className="text-3xl font-extrabold text-[#00fea2] glow-green font-mono">
              30
            </span>
            <span className="text-[9px] font-bold text-[#859398] tracking-widest mt-2 text-center leading-tight">
              DISPOSITIVOS<br />ACTIVOS
            </span>
          </div>

          {/* Dispositivos Inactivos */}
          <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#3c494e]/20 bg-[#171f33]/40">
            <span className="text-3xl font-extrabold text-[#859398]/80 font-mono">
              26
            </span>
            <span className="text-[9px] font-bold text-[#859398] tracking-widest mt-2 text-center leading-tight">
              DISPOSITIVOS<br />INACTIVOS
            </span>
          </div>
        </div>

        {/* Total Dispositivos */}
        <div className="glass-card p-4 flex flex-col items-center justify-center border border-[#00d4ff]/10 bg-[#171f33]/40">
          <span className="text-3xl font-extrabold text-[#00d4ff] glow-cyan font-mono">
            56
          </span>
          <span className="text-[9px] font-bold text-[#859398] tracking-widest mt-2">
            TOTAL DISPOSITIVOS
          </span>
        </div>
      </div>

      {/* 3. SECCIÓN INFERIOR: Listado de Dispositivos */}
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-white tracking-wider">
            Listado de Dispositivos
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 text-[#859398]" />
          </div>
        </div>

        {/* Input de Búsqueda Integrada */}
        <div className="relative">
          <input
            id="device-search"
            type="text"
            placeholder="Buscar dispositivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input px-3 py-2 bg-[#060e20] border border-[#3c494e]/30 text-xs rounded-xl"
          />
        </div>

        {/* Lista de Items */}
        <div className="flex flex-col gap-2.5">
          {filteredDevices.map((item, index) => (
            <div 
              key={index}
              className="p-3.5 rounded-2xl bg-[#171f33]/30 border border-[#3c494e]/20 flex items-center justify-between hover:border-[#00d4ff]/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-[#0b1326]">
                  {item.type === "folder" ? (
                    <Folder className="w-5 h-5 text-[#00d4ff]" />
                  ) : (
                    <ProbeIcon />
                  )}
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
                  {item.name}
                </span>
              </div>

              {item.type === "device" && (
                <span className={`w-2 h-2 rounded-full ${
                  item.status === "active" 
                    ? "bg-[#00fea2] shadow-glow-green" 
                    : "bg-[#ff3131]/60"
                }`} />
              )}
            </div>
          ))}

          {filteredDevices.length === 0 && (
            <p className="text-[11px] text-[#859398] text-center py-4">
              No se encontraron dispositivos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
