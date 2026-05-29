import type { ControlPrenatal, Paciente } from "@/types";

export function nombreCompleto(p: Paciente): string {
  return `${p.nombres} ${p.apellidos}`.trim();
}

export function controlesDe(
  controles: ControlPrenatal[],
  pacienteId: string,
): ControlPrenatal[] {
  return controles
    .filter((c) => c.pacienteId === pacienteId)
    .sort((a, b) => {
      if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
      return b.creadoEn.localeCompare(a.creadoEn);
    });
}

export function ultimoControl(
  controles: ControlPrenatal[],
  pacienteId: string,
): ControlPrenatal | undefined {
  return controlesDe(controles, pacienteId)[0];
}

export function enMesActual(iso: string, ref: Date = new Date()): boolean {
  if (!iso) return false;
  return iso.slice(0, 7) === ref.toISOString().slice(0, 7);
}

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}
