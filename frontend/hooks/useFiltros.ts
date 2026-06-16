"use client";

import { useState, useCallback } from "react";

export interface FiltrosState {
  proyecto: string;
  pozo: string;
  fechaDesde: string;
  fechaHasta: string;
}

export function useFiltros() {
  // Inicializamos las fechas por defecto (por ejemplo, desde el 1 de enero de 2026 hasta hoy)
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getStartDateString = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return thirtyDaysAgo.toISOString().split("T")[0];
  };

  const [filtros, setFiltros] = useState<FiltrosState>({
    proyecto: "",
    pozo: "",
    fechaDesde: "2026-05-01", // Fecha estática para calzar con datos mock de ejemplo
    fechaHasta: "2026-06-16",
  });

  const setProyecto = useCallback((proyecto: string) => {
    setFiltros((prev) => ({
      ...prev,
      proyecto,
      pozo: "", // Al cambiar de proyecto, limpiamos el pozo seleccionado
    }));
  }, []);

  const setPozo = useCallback((pozo: string) => {
    setFiltros((prev) => ({
      ...prev,
      pozo,
    }));
  }, []);

  const setFechaDesde = useCallback((fechaDesde: string) => {
    setFiltros((prev) => ({
      ...prev,
      fechaDesde,
    }));
  }, []);

  const setFechaHasta = useCallback((fechaHasta: string) => {
    setFiltros((prev) => ({
      ...prev,
      fechaHasta,
    }));
  }, []);

  const resetFiltros = useCallback(() => {
    setFiltros({
      proyecto: "",
      pozo: "",
      fechaDesde: "2026-05-01",
      fechaHasta: "2026-06-16",
    });
  }, []);

  return {
    filtros,
    setProyecto,
    setPozo,
    setFechaDesde,
    setFechaHasta,
    resetFiltros,
  };
}
