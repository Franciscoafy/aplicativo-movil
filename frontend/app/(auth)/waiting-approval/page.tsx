import React from "react";
import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

export default async function WaitingApprovalPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  // Si ya está aprobado, redirigir al dashboard automáticamente
  if (user.publicMetadata?.approved === true) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 bg-[#0b1326] relative overflow-hidden py-10 font-hanken">
      {/* Luces de fondo decorativas estilo Neon Dusk */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#00d4ff]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#00d4ff]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col gap-6 items-center">
        {/* Cabecera superior con Logo de Quantica */}
        <div className="h-16 w-48 relative flex items-center justify-center mb-2">
          <img 
            src="/logo.png" 
            alt="Quantica" 
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Tarjeta de Cristal de Validación */}
        <div className="glass-card p-8 border border-white/10 flex flex-col items-center text-center gap-6 bg-surface-container-lowest/40 backdrop-blur-lg rounded-2xl w-full shadow-glow-cyan/5">
          {/* Icono de candado con resplandor cian */}
          <div className="w-16 h-16 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center shadow-glow-cyan">
            <Lock className="w-7 h-7 text-[#00d4ff]" />
          </div>

          {/* Textos Informativos */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-white font-sora tracking-tight">
              Validación en Proceso
            </h2>
            <p className="text-xs text-[#859398] leading-relaxed">
              Tu cuenta está siendo revisada por un administrador. Recibirás una notificación cuando tengas acceso.
            </p>
          </div>

          {/* Badge de Estado */}
          <div className="px-4 py-1.5 rounded-full bg-[#171f33] border border-[#3c494e]/30 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb700] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ffb700] font-mono">
              Estado: Pendiente
            </span>
          </div>

          {/* Botón de Cerrar Sesión (Sign Out) con estilo Neon Dusk */}
          <SignOutButton redirectUrl="/login">
            <button className="w-full py-2.5 px-4 bg-[#00d4ff] text-[#0b1326] font-bold text-sm rounded-xl hover:brightness-110 transition-all duration-300 active:scale-95 shadow-glow-cyan">
              Log Out
            </button>
          </SignOutButton>

          {/* Texto de Ayuda / Soporte */}
          <p className="text-[11px] text-[#859398] hover:text-white transition-colors cursor-pointer border-t border-white/5 pt-4 w-full">
            ¿Necesitas ayuda? Contactar soporte
          </p>
        </div>

        {/* Identificador de Sistema Ficticio para la estética */}
        <span className="text-[9px] font-mono text-[#859398]/50 uppercase tracking-widest mt-2">
          SYSTEM_ID: NC-4402-VAL
        </span>
      </div>
    </div>
  );
}
