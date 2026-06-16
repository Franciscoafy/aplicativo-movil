import type { Metadata, Viewport } from "next";
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
      <body className="antialiased min-h-screen flex flex-col">
        <div id="app-root" className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
