"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplet, Lock, Mail, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación simulada simple para permitir pruebas rápidas
    setTimeout(() => {
      if (!email || !password) {
        setError("Por favor completa todos los campos.");
        setLoading(false);
        return;
      }
      
      // Permitir cualquier login para probar con datos simulados
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 bg-background relative overflow-hidden">
      {/* Luces de fondo decorativas estilo Neon Dusk */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col gap-6">
        {/* Logo y Encabezado */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 shadow-glow-cyan">
            <Droplet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sora">
            WELLMETRY
            <span className="text-xs uppercase font-mono px-2 py-0.5 ml-2 rounded bg-primary/20 text-primary border border-primary/30 align-middle">
              DGA
            </span>
          </h1>
          <p className="text-xs text-outline font-hanken">
            Plataforma Móvil de Telemetría y Cumplimiento Normativo
          </p>
        </div>

        {/* Tarjeta de Formulario de Cristal */}
        <div className="glass-card p-6 border border-white/10 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-white font-sora">Iniciar Sesión</h2>
            <p className="text-[11px] text-outline">Ingresa tus credenciales para acceder al monitoreo.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-status-critical/10 border border-status-critical/20 text-xs text-status-critical font-hanken">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Input Correo */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-outline">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@empresa.com"
                  className="w-full glass-input pl-10 pr-3 py-2.5 bg-surface-container-lowest/40 border border-border text-sm rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-outline">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-10 pr-10 py-2.5 bg-surface-container-lowest/40 border border-border text-sm rounded-xl"
                  required
                />
                <button
                  id="btn-toggle-password"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 bg-primary text-background font-bold text-sm rounded-xl transition-all duration-300 hover:brightness-110 active:scale-95 ${
                loading ? "opacity-70 cursor-not-allowed" : "shadow-glow-cyan"
              }`}
            >
              {loading ? "Validando..." : "Ingresar al Portal"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-outline font-mono">
          Cumplimiento DGA Chile v1.0.0
        </p>
      </div>
    </div>
  );
}
