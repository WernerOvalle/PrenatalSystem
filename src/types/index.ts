export type Categoria =
  | "consulta-general"
  | "pediatria"
  | "prenatal"
  | "oftalmologia";

/** Confirmación telefónica previa a la cita. */
export type EstadoCita = "pendiente" | "confirmado" | "no-contesto" | "cancelado";

/**
 * Si el paciente se presentó o no. Es un eje independiente de `EstadoCita`:
 * confirmar por teléfono y presentarse a la consulta son hechos distintos, y el
 * reporte de cierre del día es justamente el cruce de ambos.
 */
export type Asistencia = "sin-registro" | "llego" | "no-llego";

/** `nuevo-ingreso`: paciente que llegó sin cita previa. */
export type OrigenCita = "agendada" | "nuevo-ingreso";

export interface Cita {
  id: string;
  nombrePaciente: string;
  expediente: string;
  /** "Número de paciente" del prototipo: teléfono del paciente. */
  telefonoPaciente: string;
  /** "Número familiar" del prototipo: teléfono de un familiar. */
  telefonoFamiliar: string;
  categoria: Categoria;
  /** Fecha de la cita en formato ISO yyyy-mm-dd. */
  fecha: string;
  /**
   * Hora de la cita en formato "HH:mm". Opcional: las citas guardadas antes de
   * que existiera el campo no la tienen y se listan al final del día.
   */
  hora?: string;
  estado: EstadoCita;
  asistencia: Asistencia;
  origen: OrigenCita;
  /** Fecha que tenía la cita antes de la última reprogramación. */
  fechaAnterior?: string;
  creadoEn: string;
}
