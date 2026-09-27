import type { Asistencia, Categoria, Cita, EstadoCita, OrigenCita } from "@/types";
import { aISO } from "./fecha";
import { nuevoId } from "./id";

/**
 * Datos de ejemplo de la demo. Todo es inventado a propósito: los apellidos
 * ("Ejemplo", "Prueba", "Ficticia"…), los expedientes `DEMO-` y los teléfonos
 * `5555` dejan claro que no son pacientes reales.
 *
 * Las fechas son relativas al día en que se cargan, así la demo siempre tiene
 * citas hoy, en días pasados (con asistencia registrada) y en los próximos.
 */
type Semilla = [
  nombre: string,
  categoria: Categoria,
  /** Días respecto a hoy: -2 es anteayer, 3 es dentro de tres días. */
  dias: number,
  hora: string,
  estado: EstadoCita,
  asistencia: Asistencia,
  origen?: OrigenCita,
  /** Días respecto a hoy de la fecha original, si la cita se reprogramó. */
  diasAnterior?: number,
];

const SEMILLAS: readonly Semilla[] = [
  // Días pasados: ya con asistencia registrada.
  ["Ana Ejemplo Pérez", "prenatal", -7, "08:30", "confirmado", "llego"],
  ["Luis Prueba Gómez", "consulta-general", -6, "09:15", "no-contesto", "no-llego"],
  ["Sofía Ficticia Ramos", "pediatria", -5, "10:00", "confirmado", "llego"],
  ["Carlos Demo Herrera", "oftalmologia", -4, "11:30", "cancelado", "no-llego"],
  ["Elena Muestra Castillo", "prenatal", -3, "08:00", "confirmado", "no-llego"],
  ["Jorge Inventado Luna", "consulta-general", -2, "14:00", "pendiente", "llego", "nuevo-ingreso"],
  ["Marta Ejemplo Solís", "pediatria", -1, "09:45", "no-contesto", "llego"],
  ["Pedro Prueba Aguilar", "oftalmologia", -1, "15:30", "confirmado", "llego"],

  // Hoy: una mezcla para ver todos los estados en la agenda y el reporte.
  ["Lucía Ficticia Morales", "prenatal", 0, "08:00", "confirmado", "llego"],
  ["Diego Demo Vásquez", "consulta-general", 0, "08:45", "confirmado", "sin-registro"],
  ["Valeria Muestra Ortiz", "pediatria", 0, "09:30", "pendiente", "sin-registro"],
  ["Andrés Inventado Cruz", "oftalmologia", 0, "10:15", "no-contesto", "no-llego"],
  ["Camila Ejemplo Reyes", "prenatal", 0, "11:00", "pendiente", "sin-registro", "agendada", -2],
  ["Tomás Prueba Mendoza", "consulta-general", 0, "11:40", "pendiente", "llego", "nuevo-ingreso"],
  ["Isabel Ficticia Navarro", "pediatria", 0, "14:30", "cancelado", "sin-registro"],

  // Próximos días: todavía sin asistencia.
  ["Ricardo Demo Salazar", "prenatal", 1, "08:30", "pendiente", "sin-registro"],
  ["Paula Muestra Figueroa", "oftalmologia", 1, "10:00", "confirmado", "sin-registro"],
  ["Gabriel Inventado Rivas", "consulta-general", 2, "09:00", "no-contesto", "sin-registro"],
  ["Natalia Ejemplo Campos", "pediatria", 3, "15:00", "pendiente", "sin-registro"],
  ["Fernando Prueba Ibarra", "prenatal", 5, "08:15", "confirmado", "sin-registro"],
  ["Daniela Ficticia Paz", "oftalmologia", 7, "11:00", "pendiente", "sin-registro", "agendada", 1],
  ["Héctor Demo Molina", "consulta-general", 9, "13:30", "pendiente", "sin-registro"],
  ["Renata Muestra León", "prenatal", 12, "09:30", "pendiente", "sin-registro"],
  ["Emilio Inventado Soto", "pediatria", 14, "10:45", "pendiente", "sin-registro"],
];

function relativa(hoy: Date, dias: number): string {
  return aISO(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + dias));
}

export function generarDatosDemo(): Cita[] {
  const hoy = new Date();
  const creadoEn = hoy.toISOString();
  return SEMILLAS.map(
    ([nombre, categoria, dias, hora, estado, asistencia, origen, diasAnterior], i) => {
      const n = `${i + 1}`.padStart(2, "0");
      return {
        id: nuevoId(),
        nombrePaciente: nombre,
        expediente: `DEMO-00${n}`,
        telefonoPaciente: `5555 01${n}`,
        telefonoFamiliar: `5555 02${n}`,
        categoria,
        fecha: relativa(hoy, dias),
        hora,
        estado,
        asistencia,
        origen: origen ?? "agendada",
        ...(diasAnterior !== undefined && { fechaAnterior: relativa(hoy, diasAnterior) }),
        creadoEn,
      };
    },
  );
}
