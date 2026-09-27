import type { Asistencia, Categoria, Cita, EstadoCita } from "@/types";

/**
 * Este módulo es lógica pura, sin React: los iconos viven en
 * `@/components/iconos-dominio`. Así se puede probar sin montar componentes.
 */
export interface MetaCategoria {
  slug: Categoria;
  label: string;
  /** Tono de la paleta de marca (`--color-marca-*`). */
  tono: "azul" | "oro" | "rojo" | "verde";
}

/**
 * Única fuente de verdad de las categorías: la usa el nav, el select del
 * formulario, el calendario, los totales y las hojas imprimibles.
 */
export const CATEGORIAS: readonly MetaCategoria[] = [
  { slug: "consulta-general", label: "Consulta general", tono: "azul" },
  { slug: "pediatria", label: "Pediatría", tono: "oro" },
  { slug: "prenatal", label: "Prenatal", tono: "rojo" },
  { slug: "oftalmologia", label: "Oftalmología", tono: "verde" },
];

export function metaCategoria(slug: Categoria): MetaCategoria {
  return CATEGORIAS.find((c) => c.slug === slug) ?? CATEGORIAS[0];
}

export function esCategoria(valor: string | null): valor is Categoria {
  return CATEGORIAS.some((c) => c.slug === valor);
}

export interface MetaEstado {
  slug: EstadoCita;
  label: string;
  tono: "gris" | "verde" | "oro" | "cancelado";
}

/**
 * Los estados no se distinguen solo por color: cada chip lleva texto e icono,
 * así siguen siendo legibles con daltonismo y no se confunden con los tonos
 * de categoría, que reusan la misma paleta de marca.
 */
export const ESTADOS: readonly MetaEstado[] = [
  { slug: "pendiente", label: "Pendiente", tono: "gris" },
  { slug: "confirmado", label: "Confirmado", tono: "verde" },
  { slug: "no-contesto", label: "No contestó", tono: "oro" },
  { slug: "cancelado", label: "Canceló", tono: "cancelado" },
];

export function metaEstado(slug: EstadoCita): MetaEstado {
  return ESTADOS.find((e) => e.slug === slug) ?? ESTADOS[0];
}

export interface MetaAsistencia {
  slug: Asistencia;
  label: string;
  tono: "gris" | "verde" | "rojo";
}

/** El otro eje: si el paciente se presentó el día de la cita. */
export const ASISTENCIAS: readonly MetaAsistencia[] = [
  { slug: "sin-registro", label: "Sin registrar", tono: "gris" },
  { slug: "llego", label: "Llegó", tono: "verde" },
  { slug: "no-llego", label: "No llegó", tono: "rojo" },
];

export function metaAsistencia(slug: Asistencia): MetaAsistencia {
  return ASISTENCIAS.find((a) => a.slug === slug) ?? ASISTENCIAS[0];
}

/** "Confirmado" es un único estado; el resto de citas vivas no lo están. */
export function estaConfirmada(cita: Cita): boolean {
  return cita.estado === "confirmado";
}

export function citasDeFecha(citas: Cita[], fecha: string, categoria?: Categoria): Cita[] {
  return citas.filter(
    (c) => c.fecha === fecha && (categoria === undefined || c.categoria === categoria),
  );
}

export function citasDeCategoria(citas: Cita[], categoria: Categoria): Cita[] {
  return citas.filter((c) => c.categoria === categoria);
}

/**
 * Orden de la agenda: cronológico, porque la pantalla del día es también la
 * hoja de trabajo de la clínica. Las citas viejas sin hora caen al final; a
 * igual hora manda lo que falta confirmar y luego el nombre.
 */
export function ordenarAgenda(citas: Cita[]): Cita[] {
  const peso: Record<EstadoCita, number> = {
    pendiente: 0,
    "no-contesto": 1,
    confirmado: 2,
    cancelado: 3,
  };
  return [...citas].sort((a, b) => {
    const horaA = a.hora || "99:99";
    const horaB = b.hora || "99:99";
    if (horaA !== horaB) return horaA.localeCompare(horaB);
    if (peso[a.estado] !== peso[b.estado]) return peso[a.estado] - peso[b.estado];
    return a.nombrePaciente.localeCompare(b.nombrePaciente, "es");
  });
}

/**
 * Citas por día del mes indicado, para los contadores de las celdas del
 * calendario. Las canceladas no se cuentan: ya no ocupan un espacio.
 */
export function conteoPorDia(
  citas: Cita[],
  anio: number,
  mes: number,
  categoria?: Categoria,
): Record<string, number> {
  const prefijo = `${anio}-${`${mes + 1}`.padStart(2, "0")}`;
  const conteo: Record<string, number> = {};
  for (const c of citas) {
    if (c.estado === "cancelado") continue;
    if (categoria !== undefined && c.categoria !== categoria) continue;
    if (!c.fecha.startsWith(prefijo)) continue;
    conteo[c.fecha] = (conteo[c.fecha] ?? 0) + 1;
  }
  return conteo;
}

export interface TotalesFecha {
  total: number;
  porCategoria: Record<Categoria, number>;
}

function contadorEnCero(): Record<Categoria, number> {
  return Object.fromEntries(CATEGORIAS.map((c) => [c.slug, 0])) as Record<
    Categoria,
    number
  >;
}

/** Totales de la pantalla "Todos pacientes": citas de la fecha elegida. */
export function totalesDeFecha(citas: Cita[], fecha: string): TotalesFecha {
  const porCategoria = contadorEnCero();
  let total = 0;
  for (const c of citas) {
    if (c.fecha !== fecha || c.estado === "cancelado") continue;
    porCategoria[c.categoria] += 1;
    total += 1;
  }
  return { total, porCategoria };
}

/** Citas de hoy que siguen sin confirmarse: el contador de la campana. */
export function pendientesDeHoy(citas: Cita[], hoy: string): number {
  return citas.filter((c) => c.fecha === hoy && c.estado === "pendiente").length;
}

/** Pacientes que ya se presentaron en la fecha indicada. */
export function llegadosDeFecha(citas: Cita[], fecha: string): number {
  return citas.filter((c) => c.fecha === fecha && c.asistencia === "llego").length;
}

/** Nombres ya registrados, para el autocompletado del formulario. */
export function nombresConocidos(citas: Cita[]): string[] {
  return [...new Set(citas.map((c) => c.nombrePaciente.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

export interface GrupoCategoria {
  meta: MetaCategoria;
  citas: Cita[];
}

/**
 * Agrupa las citas de un día por categoría, en el orden de `CATEGORIAS` y ya
 * ordenadas por hora: es la lista imprimible que se reparte en la clínica.
 * Las categorías sin citas ese día se omiten para no gastar papel.
 */
export function citasPorCategoria(citas: Cita[], fecha: string): GrupoCategoria[] {
  return CATEGORIAS.map((meta) => ({
    meta,
    citas: ordenarAgenda(citasDeFecha(citas, fecha, meta.slug)),
  })).filter((g) => g.citas.length > 0);
}

export interface ResumenDia {
  fecha: string;
  confirmadosLlegaron: Cita[];
  noConfirmadosLlegaron: Cita[];
  confirmadosNoLlegaron: Cita[];
  noConfirmadosNoLlegaron: Cita[];
  /** Pacientes sin cita previa: llegaron por su cuenta. */
  nuevoIngreso: Cita[];
  /** Tenían cita y nadie marcó si llegaron: queda constancia del olvido. */
  sinRegistrar: Cita[];
  cancelados: Cita[];
}

/**
 * Reporte de cierre del día. Cada cita cae en exactamente un bucket, evaluados
 * en este orden: nuevo ingreso, cancelada, sin registrar y, ya con asistencia
 * marcada, el cruce confirmación × asistencia.
 */
export function resumenDelDia(citas: Cita[], fecha: string): ResumenDia {
  const resumen: ResumenDia = {
    fecha,
    confirmadosLlegaron: [],
    noConfirmadosLlegaron: [],
    confirmadosNoLlegaron: [],
    noConfirmadosNoLlegaron: [],
    nuevoIngreso: [],
    sinRegistrar: [],
    cancelados: [],
  };

  for (const c of ordenarAgenda(citasDeFecha(citas, fecha))) {
    if (c.origen === "nuevo-ingreso") {
      resumen.nuevoIngreso.push(c);
    } else if (c.estado === "cancelado") {
      resumen.cancelados.push(c);
    } else if (c.asistencia === "sin-registro") {
      resumen.sinRegistrar.push(c);
    } else if (c.asistencia === "llego") {
      (estaConfirmada(c) ? resumen.confirmadosLlegaron : resumen.noConfirmadosLlegaron).push(c);
    } else {
      (estaConfirmada(c)
        ? resumen.confirmadosNoLlegaron
        : resumen.noConfirmadosNoLlegaron
      ).push(c);
    }
  }

  return resumen;
}
