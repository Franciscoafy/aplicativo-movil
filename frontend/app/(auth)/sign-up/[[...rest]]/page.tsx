"use client";

import React from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 bg-[#0b1326] relative overflow-hidden py-10">
      {/* Luces de fondo decorativas estilo Neon Dusk */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#00d4ff]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#00d4ff]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col gap-4 items-center">
        {/* Logo y Encabezado (Logo agrandado 50%) */}
        <div className="flex flex-col items-center text-center gap-2 mb-4">
          <div className="h-24 w-72 relative flex items-center justify-center mb-1">
            <img 
              src="/logo.png" 
              alt="Quantica" 
              className="h-full w-auto object-contain"
            />
          </div>
          <p className="text-xs text-[#859398] font-hanken">
            Plataforma Móvil de Telemetría y Cumplimiento Normativo
          </p>
        </div>

        {/* Formulario de Registro de Clerk */}
        <SignUp routing="path" path="/sign-up" signInUrl="/login" />

        {/* Footer */}
        <p className="text-[10px] text-center text-[#859398] font-mono mt-4">
          Cumplimiento DGA Chile v1.0.0
        </p>
      </div>
    </div>
  );
}
