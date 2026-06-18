import React from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // Si no está autenticado, Next.js middleware lo redirigirá a login,
  // pero este chequeo adicional del lado del servidor garantiza la consistencia.
  if (!user) {
    redirect("/login");
  }

  // Redirigir a la página de espera si no ha sido aprobado por el administrador
  if (user.publicMetadata?.approved !== true) {
    redirect("/waiting-approval");
  }

  return <DashboardContainer>{children}</DashboardContainer>;
}
