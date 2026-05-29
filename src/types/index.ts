export type NivelRiesgo = "bajo" | "alto";

export interface Antecedentes {
  hipertension: boolean;
  diabetes: boolean;
  cesareaPrevia: boolean;
  gestaciones: number;
  partos: number;
  abortos: number;
  embarazoMultiple: boolean;
}

export interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  grupoSanguineo: string;
  fum: string;
  tallaCm: number | null;
  pesoPrevioKg: number | null;
  antecedentes: Antecedentes;
  creadoEn: string;
}

export interface ControlPrenatal {
  id: string;
  pacienteId: string;
  fecha: string;
  pesoKg: number | null;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  alturaUterinaCm: number | null;
  fcfLpm: number | null;
  movimientosFetales: boolean;
  edemas: boolean;
  observaciones: string;
  proximaCita: string;
  creadoEn: string;
}
