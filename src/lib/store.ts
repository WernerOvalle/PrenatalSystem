"use client";

import { useSyncExternalStore } from "react";
import type { ControlPrenatal, Paciente } from "@/types";
import { nuevoId } from "./id";

const PACIENTES_KEY = "prenatal:pacientes";
const CONTROLES_KEY = "prenatal:controles";

let pacientes: Paciente[] | null = null;
let controles: ControlPrenatal[] | null = null;
const listeners = new Set<() => void>();

const EMPTY_PACIENTES: readonly Paciente[] = [];
const EMPTY_CONTROLES: readonly ControlPrenatal[] = [];

function leer<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function asegurarCarga(): void {
  if (pacientes === null) pacientes = leer<Paciente>(PACIENTES_KEY);
  if (controles === null) controles = leer<ControlPrenatal>(CONTROLES_KEY);
}

function persistir(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PACIENTES_KEY, JSON.stringify(pacientes ?? []));
  window.localStorage.setItem(CONTROLES_KEY, JSON.stringify(controles ?? []));
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
    if (e.key === PACIENTES_KEY || e.key === CONTROLES_KEY) {
      pacientes = null;
      controles = null;
      emitir();
    }
  });
}

export function usePacientes(): Paciente[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      asegurarCarga();
      return pacientes as Paciente[];
    },
    () => EMPTY_PACIENTES as Paciente[],
  );
}

export function useControles(): ControlPrenatal[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      asegurarCarga();
      return controles as ControlPrenatal[];
    },
    () => EMPTY_CONTROLES as ControlPrenatal[],
  );
}

export function crearPaciente(
  datos: Omit<Paciente, "id" | "creadoEn">,
): Paciente {
  asegurarCarga();
  const paciente: Paciente = {
    ...datos,
    id: nuevoId(),
    creadoEn: new Date().toISOString(),
  };
  pacientes = [paciente, ...(pacientes as Paciente[])];
  persistir();
  emitir();
  return paciente;
}

export function actualizarPaciente(
  id: string,
  datos: Omit<Paciente, "id" | "creadoEn">,
): void {
  asegurarCarga();
  pacientes = (pacientes as Paciente[]).map((p) =>
    p.id === id ? { ...p, ...datos } : p,
  );
  persistir();
  emitir();
}

export function eliminarPaciente(id: string): void {
  asegurarCarga();
  pacientes = (pacientes as Paciente[]).filter((p) => p.id !== id);
  controles = (controles as ControlPrenatal[]).filter((c) => c.pacienteId !== id);
  persistir();
  emitir();
}

export function crearControl(
  datos: Omit<ControlPrenatal, "id" | "creadoEn">,
): ControlPrenatal {
  asegurarCarga();
  const control: ControlPrenatal = {
    ...datos,
    id: nuevoId(),
    creadoEn: new Date().toISOString(),
  };
  controles = [control, ...(controles as ControlPrenatal[])];
  persistir();
  emitir();
  return control;
}

export function eliminarControl(id: string): void {
  asegurarCarga();
  controles = (controles as ControlPrenatal[]).filter((c) => c.id !== id);
  persistir();
  emitir();
}
