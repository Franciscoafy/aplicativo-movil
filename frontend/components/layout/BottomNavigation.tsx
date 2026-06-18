"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Folder, Droplet, Settings } from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      id: "nav-dash",
      label: "DASHBOARD",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      id: "nav-proyectos",
      label: "PROYECTOS",
      href: "/proyectos",
      icon: Folder,
    },
    {
      id: "nav-pozos",
      label: "POZOS",
      href: "/pozos",
      icon: Droplet,
    },
    {
      id: "nav-config",
      label: "CONFIGURACIÓN",
      href: "/configuracion",
      icon: Settings,
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b1326]/95 backdrop-blur-lg border-t border-[#3c494e]/30 px-1 pt-1.5 flex items-center justify-around md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.375rem)" }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        // El tab activo coincide con el inicio de la ruta
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            id={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-0.5 transition-all ${
              isActive
                ? "text-[#00d4ff] font-bold scale-105"
                : "text-[#859398] hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${
              isActive ? "bg-[#00d4ff]/10" : "bg-transparent"
            }`}>
              <Icon className={`w-5 h-5 ${isActive ? "shadow-glow-cyan" : ""}`} />
            </div>
            <span className="text-[9px] mt-1 tracking-wider font-mono font-bold">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
