"use client";

import React from "react";
import { Waves, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";

export default function Header() {
  const router = useRouter();

  const [logoError, setLogoError] = React.useState(false);

  const handleProfileClick = () => {
    // Redirigir a login para simular desconexión u otras pruebas
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b1326]/90 backdrop-blur-md border-b border-[#3c494e]/30 px-4 py-3.5 flex items-center justify-between font-hanken">
      {/* Lado Izquierdo: Ondas + Marca Quantica */}
      <div className="flex items-center gap-2">
        {!logoError ? (
          <div className="h-20 w-48 relative flex items-center justify-start">
            <img 
              src="/logo.png" 
              alt="Quantica" 
              className="h-full w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          </div>
        ) : (
          <>
            <div className="p-1 rounded bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center w-8 h-8 overflow-hidden">
              <Waves className="w-5 h-5 text-[#00d4ff] shadow-glow-cyan" />
            </div>
            <span className="text-base font-bold tracking-wide text-white font-sora">
              Quantica
            </span>
          </>
        )}
      </div>

      {/* Lado Derecho: Buscar + Perfil */}
      <div className="flex items-center gap-4 text-outline">
        <button id="btn-search-header" className="hover:text-white transition-colors" title="Buscar">
          <Search className="w-5 h-5 text-[#859398]" />
        </button>
        
        <Show when="signed-in">
          <UserButton afterSignOutUrl="/" />
        </Show>
        <Show when="signed-out">
          <button 
            id="btn-profile-header" 
            onClick={handleProfileClick}
            className="hover:text-white transition-colors p-0.5 rounded-full border border-[#859398]/30" 
            title="Mi Perfil / Salir"
          >
            <User className="w-5 h-5 text-[#859398]" />
          </button>
        </Show>
      </div>
    </header>
  );
}
