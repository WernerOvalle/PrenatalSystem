const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

/** Encabezados del calendario del prototipo: la semana arranca en domingo. */
export const DIAS_SEMANA = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"] as const;

/**
 * Interpreta un ISO yyyy-mm-dd como fecha local, no UTC. Sin la hora explícita,
 * `new Date("2026-08-05")` se parsea como medianoche UTC y en Guatemala (UTC−6)
 * termina cayendo el día anterior.
 */
export function parseFecha(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Serializa a yyyy-mm-dd usando los componentes locales de la fecha. */
export function aISO(d: Date): string {
  const mes = `${d.getMonth() + 1}`.padStart(2, "0");
  const dia = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function hoyISO(): string {
  return aISO(new Date());
}

/** "5 Agosto 2026", como el encabezado de la agenda del prototipo. */
export function formatFechaLarga(iso: string): string {
  const d = parseFecha(iso);
  if (!d) return "—";
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** "05/08/26", el DD/MM/AA de los campos del prototipo. */
export function formatFechaCorta(iso: string): string {
  const d = parseFecha(iso);
  if (!d) return "—";
  const dia = `${d.getDate()}`.padStart(2, "0");
  const mes = `${d.getMonth() + 1}`.padStart(2, "0");
  const anio = `${d.getFullYear()}`.slice(2);
  return `${dia}/${mes}/${anio}`;
}

export function nombreMes(mes: number): string {
  return MESES[mes] ?? "";
}

/** "AGOSTO 2026", el título del calendario del prototipo. */
export function tituloMes(anio: number, mes: number): string {
  return `${nombreMes(mes).toUpperCase()} ${anio}`;
}

/** Mes en formato yyyy-mm, usado en el query `?mes=`. */
export function aMesISO(anio: number, mes: number): string {
  return `${anio}-${`${mes + 1}`.padStart(2, "0")}`;
}

export function mesActual(): { anio: number; mes: number } {
  const hoy = new Date();
  return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
}

/** Lee un `?mes=yyyy-mm`; si no es válido, devuelve el mes actual. */
export function parseMesISO(valor: string | null): { anio: number; mes: number } {
  const m = /^(\d{4})-(\d{2})$/.exec(valor ?? "");
  if (!m) return mesActual();
  const anio = Number(m[1]);
  const mes = Number(m[2]) - 1;
  if (mes < 0 || mes > 11) return mesActual();
  return { anio, mes };
}

export function mesAnterior(anio: number, mes: number): { anio: number; mes: number } {
  return mes === 0 ? { anio: anio - 1, mes: 11 } : { anio, mes: mes - 1 };
}

export function mesSiguiente(anio: number, mes: number): { anio: number; mes: number } {
  return mes === 11 ? { anio: anio + 1, mes: 0 } : { anio, mes: mes + 1 };
}

export interface DiaCalendario {
  iso: string;
  dia: number;
  esDelMes: boolean;
}

/**
 * Rejilla del calendario empezando en domingo, con los días de relleno del mes
 * anterior y del siguiente para completar semanas enteras.
 */
export function matrizMes(anio: number, mes: number): DiaCalendario[][] {
  const primero = new Date(anio, mes, 1);
  const inicio = new Date(anio, mes, 1 - primero.getDay());
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const total = Math.ceil((primero.getDay() + diasEnMes) / 7) * 7;

  const semanas: DiaCalendario[][] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
    if (i % 7 === 0) semanas.push([]);
    semanas[semanas.length - 1].push({
      iso: aISO(d),
      dia: d.getDate(),
      esDelMes: d.getMonth() === mes && d.getFullYear() === anio,
    });
  }
  return semanas;
}
