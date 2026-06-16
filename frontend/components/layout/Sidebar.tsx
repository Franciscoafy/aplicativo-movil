"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Folder, Droplet, Settings, Waves } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      id: "side-dash",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      id: "side-proyectos",
      label: "Proyectos",
      href: "/proyectos",
      icon: Folder,
    },
    {
      id: "side-pozos",
      label: "Pozos / Telemetría",
      href: "/pozos",
      icon: Droplet,
    },
    {
      id: "side-config",
      label: "Configuración",
      href: "/configuracion",
      icon: Settings,
    },
  ];

  const [logoError, setLogoError] = React.useState(false);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#060e20]/95 border-r border-[#3c494e]/30 min-h-screen p-4 sticky top-0 font-hanken">
      {/* Ondas + Marca Quantica */}
      <div className="flex items-center gap-2 mb-8 px-2">
        {!logoError ? (
          <div className="h-28 w-52 relative flex items-center justify-start">
            <img 
              src="/logo.png" 
              alt="Quantica" 
              className="h-full w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          </div>
        ) : (
          <>
            <div className="p-1.5 rounded bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center w-8 h-8 overflow-hidden">
              <Waves className="w-5 h-5 text-[#00d4ff] shadow-glow-cyan" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-white font-sora">
                Quantica
              </h2>
              <p className="text-[10px] text-[#859398] font-mono">TELEMETRÍA MÓVIL</p>
            </div>
          </>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              id={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] font-bold"
                  : "text-[#859398] hover:text-white hover:bg-[#171f33]/40 border border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "shadow-glow-cyan" : ""}`} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3 rounded-xl bg-[#171f33]/40 border border-[#3c494e]/20 text-xs text-[#859398]">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#00fea2] pulse-active"></span>
          <span className="text-white font-bold font-mono text-[10px]">SISTEMA ONLINE</span>
        </div>
        <p className="text-[10px] leading-relaxed">
          Monitoreo activo para pozos y cumplimiento DGA.
        </p>
      </div>
    </aside>
  );
}
