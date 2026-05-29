const MS_DIA = 86_400_000;

export function parseFecha(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function diasDesde(fum: string, ref: Date = new Date()): number | null {
  const f = parseFecha(fum);
  if (!f) return null;
  return Math.floor((ref.getTime() - f.getTime()) / MS_DIA);
}

export interface EdadGestacional {
  semanas: number;
  dias: number;
  texto: string;
}

export function edadGestacional(
  fum: string,
  ref: Date = new Date(),
): EdadGestacional | null {
  const dias = diasDesde(fum, ref);
  if (dias === null || dias < 0 || dias > 7 * 45) return null;
  const semanas = Math.floor(dias / 7);
  const resto = dias % 7;
  return { semanas, dias: resto, texto: `${semanas}+${resto}` };
}

export function fpp(fum: string): string | null {
  const f = parseFecha(fum);
  if (!f) return null;
  return new Date(f.getTime() + 280 * MS_DIA).toISOString().slice(0, 10);
}

export function trimestre(fum: string, ref: Date = new Date()): 1 | 2 | 3 | null {
  const eg = edadGestacional(fum, ref);
  if (!eg) return null;
  if (eg.semanas < 14) return 1;
  if (eg.semanas < 28) return 2;
  return 3;
}

export function edadAnios(
  fechaNacimiento: string,
  ref: Date = new Date(),
): number | null {
  const f = parseFecha(fechaNacimiento);
  if (!f) return null;
  let edad = ref.getFullYear() - f.getFullYear();
  const meses = ref.getMonth() - f.getMonth();
  if (meses < 0 || (meses === 0 && ref.getDate() < f.getDate())) edad--;
  return edad;
}

export function formatFecha(iso: string): string {
  const f = parseFecha(iso);
  if (!f) return "—";
  return f.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
