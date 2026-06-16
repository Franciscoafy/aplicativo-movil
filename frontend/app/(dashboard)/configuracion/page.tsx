"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Shield, 
  LogOut, 
  Sun, 
  Moon, 
  Lock, 
  Fingerprint, 
  ChevronRight, 
  User, 
  Mail, 
  Edit2, 
  Eye, 
  EyeOff, 
  Check, 
  X,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ConfiguracionPage() {
  const router = useRouter();
  
  // 1. Estados principales de Configuración
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [biometricActive, setBiometricActive] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  
  // 2. Estados para modal de Contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passUpdating, setPassUpdating] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  // 3. Estados para simulador de Biometría
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioScanState, setBioScanState] = useState<"scanning" | "success" | "idle">("idle");

  // Cargar configuraciones guardadas e inicializar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.add("light-theme");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.remove("light-theme");
    }
    
    const savedBio = localStorage.getItem("biometric");
    if (savedBio === "disabled") {
      setBiometricActive(false);
    } else {
      setBiometricActive(true);
    }
  }, []);

  // Manejar el cambio inmediato de tema (conmutación interactiva)
  const handleThemeChange = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
    }
  };

  // Guardar todas las configuraciones de manera persistente
  const handleSaveAll = () => {
    setSavingAll(true);
    setTimeout(() => {
      setSavingAll(false);
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      localStorage.setItem("biometric", biometricActive ? "enabled" : "disabled");
      alert("Configuración guardada correctamente en el sistema.");
    }, 1000);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  // Simular escaneo de huella/FaceID al cambiar toggle
  const handleBiometricToggle = () => {
    if (!biometricActive) {
      // Si se va a activar, simular el escaneo
      setShowBioModal(true);
      setBioScanState("scanning");
      setTimeout(() => {
        setBioScanState("success");
        setTimeout(() => {
          setBiometricActive(true);
          setShowBioModal(false);
          setBioScanState("idle");
        }, 1000);
      }, 1500);
    } else {
      // Si se desactiva, hacerlo directo
      setBiometricActive(false);
    }
  };

  // Guardar cambio de contraseña
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas nuevas no coinciden.");
      return;
    }
    setPassUpdating(true);
    setTimeout(() => {
      setPassUpdating(false);
      setPassSuccess(true);
      setTimeout(() => {
        // Resetear
        setShowPasswordModal(false);
        setPassSuccess(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1200);
    }, 1500);
  };

  return (
    <div className={`flex flex-col gap-5 font-mono max-w-md mx-auto pb-8 min-h-screen relative transition-colors duration-300 ${
      isDarkMode ? "bg-[#0b1326] text-white" : "bg-gray-100 text-gray-800"
    }`}>
      
      {/* CABECERA DE LA PÁGINA */}
      <div className="flex flex-col gap-1 px-3.5 pt-4">
        <h2 className={`text-xl font-extrabold tracking-tight font-sora ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Configuración
        </h2>
        <p className={`text-[10px] font-medium leading-none ${isDarkMode ? "text-[#859398]" : "text-gray-500"}`}>
          Gestiona tu perfil y preferencias de monitoreo.
        </p>
      </div>

      {/* TARJETA DE PERFIL DEL USUARIO */}
      <div className={`mx-3.5 p-5 rounded-2xl border flex flex-col gap-4 transition-colors duration-300 ${
        isDarkMode ? "bg-[#171f33]/40 border-[#3c494e]/20" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="flex items-center gap-4">
          {/* Avatar con botón de edición */}
          <div className="relative w-16 h-16 rounded-full border-2 border-[#00d4ff]/40 overflow-visible flex-shrink-0">
            <Image 
              src="/carlos_avatar.png" 
              alt="Carlos Mendoza Avatar"
              fill
              className="rounded-full object-cover"
              priority
            />
            <button className="absolute bottom-0 right-0 p-1.5 bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0b1326] rounded-full shadow-lg border border-[#0b1326]/40 transition-colors">
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-extrabold text-[#00d4ff] tracking-widest uppercase bg-[#00d4ff]/10 px-2.5 py-0.5 rounded-full w-max">
              Ingeniero de Campo
            </span>
            <h3 className={`text-base font-extrabold tracking-tight font-sora leading-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Carlos Mendoza
            </h3>
          </div>
        </div>

        <div className={`flex flex-col gap-3 pt-3 border-t ${isDarkMode ? "border-[#3c494e]/20" : "border-gray-100"}`}>
          <div className="flex flex-col gap-1">
            <span className={`text-[8px] font-bold uppercase ${isDarkMode ? "text-[#859398]" : "text-gray-400"}`}>
              Nombre de usuario
            </span>
            <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Carlos Mendoza
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className={`text-[8px] font-bold uppercase ${isDarkMode ? "text-[#859398]" : "text-gray-400"}`}>
              Correo electrónico
            </span>
            <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              c.mendoza@hydrocontrol.tech
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN SEGURIDAD */}
      <div className="flex flex-col gap-2">
        <span className={`text-[9px] font-bold uppercase tracking-widest px-4 ${isDarkMode ? "text-[#859398]" : "text-gray-400"}`}>
          Seguridad
        </span>

        <div className={`mx-3.5 rounded-2xl border divide-y transition-colors duration-300 ${
          isDarkMode 
            ? "bg-[#171f33]/30 border-[#3c494e]/20 divide-[#3c494e]/10" 
            : "bg-white border-gray-200 divide-gray-100 shadow-sm"
        }`}>
          {/* Cambiar Contraseña */}
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-4 text-left transition-colors duration-200 hover:bg-black/5 rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                isDarkMode ? "bg-[#00d4ff]/10 text-[#00d4ff]" : "bg-sky-50 text-sky-600"
              }`}>
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-extrabold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Cambiar Contraseña
                </span>
                <span className={`text-[8px] font-medium ${isDarkMode ? "text-[#859398]" : "text-gray-400"}`}>
                  Actualizada hace 3 meses
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${isDarkMode ? "text-[#859398]" : "text-gray-400"}`} />
          </button>

          {/* Autenticación Biométrica */}
          <div className="flex items-center justify-between p-4 rounded-b-2xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                isDarkMode ? "bg-[#00fea2]/10 text-[#00fea2]" : "bg-emerald-50 text-emerald-600"
              }`}>
                <Fingerprint className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-extrabold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Autenticación Biométrica
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button 
              onClick={handleBiometricToggle}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors relative duration-300 focus:outline-none ${
                biometricActive ? "bg-[#00d4ff]" : (isDarkMode ? "bg-gray-700" : "bg-gray-300")
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                biometricActive ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN APARIENCIA */}
      <div className="flex flex-col gap-2">
        <span className={`text-[9px] font-bold uppercase tracking-widest px-4 ${isDarkMode ? "text-[#859398]" : "text-gray-400"}`}>
          Apariencia
        </span>

        <div className={`mx-3.5 rounded-2xl border p-4 flex items-center justify-between transition-colors duration-300 ${
          isDarkMode ? "bg-[#171f33]/30 border-[#3c494e]/20" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
              isDarkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
            }`}>
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-extrabold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Modo Claro/Oscuro
              </span>
              <span className={`text-[8px] font-medium ${isDarkMode ? "text-[#859398]" : "text-gray-400"}`}>
                {isDarkMode ? "Actualmente en modo nocturno" : "Actualmente en modo claro"}
              </span>
            </div>
          </div>

          {/* Segmented Control (mockup style) */}
          <div className={`flex p-0.5 rounded-xl border transition-colors ${
            isDarkMode ? "bg-[#060e20] border-[#3c494e]/20" : "bg-gray-100 border-gray-200"
          }`}>
            <button
              onClick={() => handleThemeChange(false)}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                !isDarkMode 
                  ? "bg-[#00d4ff] text-[#0b1326] shadow-sm font-bold" 
                  : "text-[#859398] hover:text-white"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleThemeChange(true)}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                isDarkMode 
                  ? "bg-[#00d4ff] text-[#0b1326] shadow-sm font-bold" 
                  : "text-[#859398] hover:text-gray-700"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN SISTEMA */}
      <div className="flex flex-col gap-2">
        <span className={`text-[9px] font-bold uppercase tracking-widest px-4 ${isDarkMode ? "text-[#859398]" : "text-gray-400"}`}>
          Sistema
        </span>

        <div className={`mx-3.5 rounded-2xl border divide-y transition-colors duration-300 ${
          isDarkMode 
            ? "bg-[#171f33]/30 border-[#3c494e]/20 divide-[#3c494e]/10" 
            : "bg-white border-gray-200 divide-gray-100 shadow-sm"
        }`}>
          {/* Cerrar Sesión */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-red-500/5 transition-colors duration-200 rounded-2xl"
          >
            <div className="p-2 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-red-500">
              Cerrar Sesión
            </span>
          </button>
        </div>
      </div>

      {/* BOTÓN DE GUARDAR CAMBIOS GLOBAL */}
      <div className="mx-3.5 mt-2">
        <button
          onClick={handleSaveAll}
          disabled={savingAll}
          className="w-full py-3 bg-[#00d4ff] hover:bg-[#3cd7ff] text-[#0b1326] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow-cyan outline-none"
        >
          {savingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando Cambios...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </div>

      {/* MONOSPACE SYSTEM VERSION INFO */}
      <div className="flex flex-col items-center justify-center mt-4">
        <span className={`text-[8px] font-bold tracking-widest ${isDarkMode ? "text-[#859398]/60" : "text-gray-400"}`}>
          HYDROCONTROL V2.4.0-STABLE
        </span>
      </div>


      {/* ==================== MODAL: CAMBIAR CONTRASEÑA ==================== */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-4 shadow-2xl relative ${
            isDarkMode ? "bg-[#0c162d] border-[#00d4ff]/30 text-white" : "bg-white border-gray-200 text-gray-800"
          }`}>
            <button 
              onClick={() => setShowPasswordModal(false)}
              className={`absolute top-4 right-4 p-1 rounded-lg hover:bg-black/10 transition-colors ${
                isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#00d4ff]" />
              <h3 className="text-sm font-extrabold font-sora">Actualizar Contraseña</h3>
            </div>

            {passSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/40">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-400">Contraseña cambiada con éxito</span>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[8px] font-bold uppercase ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                        isDarkMode 
                          ? "bg-[#060e20] border-[#3c494e]/30 text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50" 
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:border-[#00d4ff]"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[8px] font-bold uppercase ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Mínimo 8 caracteres"
                      className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                        isDarkMode 
                          ? "bg-[#060e20] border-[#3c494e]/30 text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50" 
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:border-[#00d4ff]"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[8px] font-bold uppercase ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repite la contraseña"
                      className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                        isDarkMode 
                          ? "bg-[#060e20] border-[#3c494e]/30 text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/50" 
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:border-[#00d4ff]"
                      }`}
                    />
                  </div>
                </div>

                {/* Toggle ver contraseñas */}
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className={`text-[8px] font-bold uppercase flex items-center gap-1.5 w-max hover:underline self-end ${
                    isDarkMode ? "text-[#859398]" : "text-gray-500"
                  }`}
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPasswords ? "Ocultar contraseña" : "Ver contraseña"}
                </button>

                <button
                  type="submit"
                  disabled={passUpdating}
                  className="w-full py-2.5 bg-[#00d4ff] hover:bg-[#3cd7ff] text-[#0b1326] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-glow-cyan"
                >
                  {passUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Guardar Nueva Contraseña"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}


      {/* ==================== MODAL: SIMULADOR BIOMETRÍA ==================== */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-xs rounded-2xl border p-6 flex flex-col items-center justify-center gap-5 shadow-2xl ${
            isDarkMode ? "bg-[#0c162d] border-[#00d4ff]/30 text-white" : "bg-white border-gray-200 text-gray-800"
          }`}>
            {bioScanState === "scanning" ? (
              <>
                <div className="w-16 h-16 rounded-full border border-[#00d4ff]/30 flex items-center justify-center relative bg-[#00d4ff]/5 animate-pulse">
                  <Fingerprint className="w-8 h-8 text-[#00d4ff] animate-ping absolute" />
                  <Fingerprint className="w-8 h-8 text-[#00d4ff] z-10" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-xs font-extrabold tracking-wide font-sora">Verificando Huella / FaceID</span>
                  <span className="text-[9px] text-[#859398]">Por favor, mantén presionado tu lector físico...</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-xs font-extrabold text-emerald-400 font-sora">Identidad Confirmada</span>
                  <span className="text-[9px] text-[#859398]">Biometría activada con éxito</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
