"use client";

import React, { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNavigation from "./BottomNavigation";

interface DashboardContainerProps {
  children: React.ReactNode;
}

export default function DashboardContainer({ children }: DashboardContainerProps) {
  // Inicializar el tema global desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-white">
      {/* Sidebar - Visible en escritorio/tablet */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Header - Sticky arriba */}
        <Header />

        {/* Contenido de la Página */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Bottom Bar - Visible solo en móvil */}
      <BottomNavigation />
    </div>
  );
}
