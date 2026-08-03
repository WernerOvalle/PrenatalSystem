"use client";

import { useSyncExternalStore } from "react";
import type { Asistencia, Cita, EstadoCita } from "@/types";
import { nuevoId } from "./id";

const CITAS_KEY = "citas:v1";

let citas: Cita[] | null = null;
const listeners = new Set<() => void>();

const EMPTY_CITAS: readonly Cita[] = [];

/**
 * Las citas guardadas antes de que existieran `asistencia` y `origen` siguen en
 * el navegador sin esos campos. Se completan al leer, así no hace falta migrar
 * la llave ni pedirle nada al usuario.
 */
function normalizar(cita: Cita): Cita {
  return {
    ...cita,
    asistencia: cita.asistencia ?? "sin-registro",
    origen: cita.origen ?? "agendada",
  };
}

function leer(): Cita[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CITAS_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Cita[]).map(normalizar);
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

type DatosNuevaCita = Omit<Cita, "id" | "creadoEn" | "estado" | "asistencia" | "origen"> & {
  origen?: Cita["origen"];
};

/**
 * El paciente de nuevo ingreso nace ya presente: llegó a la clínica, esa es la
 * razón de registrarlo. Su `estado` se queda en `pendiente` porque nunca se le
 * llamó a confirmar; el reporte lo saca por su propio bucket.
 */
export function crearCita(datos: DatosNuevaCita): Cita {
  asegurarCarga();
  const origen = datos.origen ?? "agendada";
  const cita: Cita = {
    ...datos,
    origen,
    id: nuevoId(),
    estado: "pendiente",
    asistencia: origen === "nuevo-ingreso" ? "llego" : "sin-registro",
    creadoEn: new Date().toISOString(),
  };
  citas = [cita, ...(citas as Cita[])];
  persistir();
  emitir();
  return cita;
}

/** Mueve la cita a otra fecha y hora, y deja registro de dónde venía. */
export function reprogramarCita(id: string, nuevaFecha: string, nuevaHora?: string): void {
  asegurarCarga();
  citas = (citas as Cita[]).map((c) =>
    c.id === id
      ? {
          ...c,
          fecha: nuevaFecha,
          hora: nuevaHora ?? c.hora,
          fechaAnterior: c.fecha,
          estado: "pendiente" as EstadoCita,
          asistencia: "sin-registro" as Asistencia,
        }
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

export function cambiarAsistencia(id: string, asistencia: Asistencia): void {
  asegurarCarga();
  citas = (citas as Cita[]).map((c) => (c.id === id ? { ...c, asistencia } : c));
  persistir();
  emitir();
}

export function eliminarCita(id: string): void {
  asegurarCarga();
  citas = (citas as Cita[]).filter((c) => c.id !== id);
  persistir();
  emitir();
}
