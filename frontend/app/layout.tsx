import type { Metadata, Viewport } from "next";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telemetría de Pozos DGA — Control de Extracción",
  description: "Plataforma de visualización de telemetría y cumplimiento normativo DGA para pozos de agua y control de caudales.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col bg-[#0b1326] text-white">
        <ClerkProvider>
          <div id="app-root" className="flex-1 flex flex-col">
            {/* Cabecera de autenticación Clerk al nivel de la raíz */}
            <header className="w-full bg-[#0b1326]/60 backdrop-blur-md border-b border-[#3c494e]/20 px-4 py-3 flex items-center justify-between font-hanken">
              <span className="text-sm font-bold tracking-wide text-white font-sora">
                WELLMETRY
              </span>
              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="px-3.5 py-1.5 text-xs font-semibold text-[#859398] hover:text-white border border-[#3c494e]/30 hover:border-white/20 rounded-xl transition-all duration-200">
                      Iniciar Sesión
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-3.5 py-1.5 text-xs font-semibold bg-[#00d4ff] text-[#0b1326] hover:brightness-110 rounded-xl transition-all duration-200 shadow-glow-cyan">
                      Registrarse
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton afterSignOutUrl="/" />
                </Show>
              </div>
            </header>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}

