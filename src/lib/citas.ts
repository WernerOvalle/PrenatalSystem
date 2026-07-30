import type { Categoria, Cita, EstadoCita } from "@/types";

/**
 * Este módulo es lógica pura, sin React: los iconos viven en
 * `@/components/iconos-dominio`. Así se puede probar sin montar componentes.
 */
export interface MetaCategoria {
  slug: Categoria;
  label: string;
  /** Tono heráldico del escudo de la UFM. */
  tono: "azul" | "oro" | "rojo";
}

/**
 * Única fuente de verdad de las categorías: la usa el nav, el select del
 * formulario, el calendario y la pantalla de totales.
 */
export const CATEGORIAS: readonly MetaCategoria[] = [
  { slug: "consulta-general", label: "Consulta general", tono: "azul" },
  { slug: "pediatria", label: "Pediatría", tono: "oro" },
  { slug: "prenatal", label: "Prenatal", tono: "rojo" },
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
 * de categoría, que reusan la misma paleta del escudo.
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

export function citasDeFecha(citas: Cita[], fecha: string, categoria?: Categoria): Cita[] {
  return citas.filter(
    (c) => c.fecha === fecha && (categoria === undefined || c.categoria === categoria),
  );
}

export function citasDeCategoria(citas: Cita[], categoria: Categoria): Cita[] {
  return citas.filter((c) => c.categoria === categoria);
}

/** Orden de la agenda: primero lo que falta confirmar, luego por nombre. */
export function ordenarAgenda(citas: Cita[]): Cita[] {
  const peso: Record<EstadoCita, number> = {
    pendiente: 0,
    "no-contesto": 1,
    confirmado: 2,
    cancelado: 3,
  };
  return [...citas].sort((a, b) => {
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

/** Totales de la pantalla "Todos pacientes": citas de la fecha elegida. */
export function totalesDeFecha(citas: Cita[], fecha: string): TotalesFecha {
  const porCategoria: Record<Categoria, number> = {
    "consulta-general": 0,
    pediatria: 0,
    prenatal: 0,
  };
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

/** Nombres ya registrados, para el autocompletado del formulario. */
export function nombresConocidos(citas: Cita[]): string[] {
  return [...new Set(citas.map((c) => c.nombrePaciente.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}
