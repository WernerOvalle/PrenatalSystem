export type Categoria = "consulta-general" | "pediatria" | "prenatal";

export type EstadoCita = "pendiente" | "confirmado" | "no-contesto" | "cancelado";

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
  estado: EstadoCita;
  /** Fecha que tenía la cita antes de la última reprogramación. */
  fechaAnterior?: string;
  creadoEn: string;
}
