"use client";

import { useSyncExternalStore } from "react";
import type { Cita, EstadoCita } from "@/types";
import { nuevoId } from "./id";

const CITAS_KEY = "citas:v1";

let citas: Cita[] | null = null;
const listeners = new Set<() => void>();

const EMPTY_CITAS: readonly Cita[] = [];

function leer(): Cita[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CITAS_KEY);
    return raw ? (JSON.parse(raw) as Cita[]) : [];
  } catch {
    return [];
  }
}

function asegurarCarga(): void {
  if (citas === null) citas = leer();
}

function persistir(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CITAS_KEY, JSON.stringify(citas ?? []));
}

function emitir(): void {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CITAS_KEY) {
      citas = null;
      emitir();
    }
  });
}

export function useCitas(): Cita[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      asegurarCarga();
      return citas as Cita[];
    },
    () => EMPTY_CITAS as Cita[],
  );
}

export function crearCita(datos: Omit<Cita, "id" | "creadoEn" | "estado">): Cita {
  asegurarCarga();
  const cita: Cita = {
    ...datos,
    id: nuevoId(),
    estado: "pendiente",
    creadoEn: new Date().toISOString(),
  };
  citas = [cita, ...(citas as Cita[])];
  persistir();
  emitir();
  return cita;
}

/** Mueve la cita a otra fecha y deja registro de dónde venía. */
export function reprogramarCita(id: string, nuevaFecha: string): void {
  asegurarCarga();
  citas = (citas as Cita[]).map((c) =>
    c.id === id
      ? { ...c, fecha: nuevaFecha, fechaAnterior: c.fecha, estado: "pendiente" as EstadoCita }
      : c,
  );
  persistir();
  emitir();
}

export function cambiarEstadoCita(id: string, estado: EstadoCita): void {
  asegurarCarga();
  citas = (citas as Cita[]).map((c) => (c.id === id ? { ...c, estado } : c));
  persistir();
  emitir();
}

export function eliminarCita(id: string): void {
  asegurarCarga();
  citas = (citas as Cita[]).filter((c) => c.id !== id);
  persistir();
  emitir();
}
