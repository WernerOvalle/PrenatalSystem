import type { ControlPrenatal, NivelRiesgo, Paciente } from "@/types";
import { edadAnios } from "./gestational";

export interface ResultadoRiesgo {
  nivel: NivelRiesgo;
  factores: string[];
}

export function evaluarRiesgo(
  paciente: Paciente,
  ultimoControl?: ControlPrenatal,
): ResultadoRiesgo {
  const factores: string[] = [];

  const edad = edadAnios(paciente.fechaNacimiento);
  if (edad !== null && edad < 18) factores.push(`Edad materna ${edad} años (menor de 18)`);
  if (edad !== null && edad > 35) factores.push(`Edad materna ${edad} años (mayor de 35)`);

  const a = paciente.antecedentes;
  if (a.hipertension) factores.push("Antecedente de hipertensión");
  if (a.diabetes) factores.push("Antecedente de diabetes");
  if (a.cesareaPrevia) factores.push("Cesárea previa");
  if (a.abortos >= 2) factores.push(`${a.abortos} abortos previos`);
  if (a.embarazoMultiple) factores.push("Embarazo múltiple");

  if (
    ultimoControl &&
    ultimoControl.presionSistolica !== null &&
    ultimoControl.presionDiastolica !== null &&
    (ultimoControl.presionSistolica >= 140 || ultimoControl.presionDiastolica >= 90)
  ) {
    factores.push(
      `Presión arterial elevada (${ultimoControl.presionSistolica}/${ultimoControl.presionDiastolica} mmHg)`,
    );
  }

  return { nivel: factores.length > 0 ? "alto" : "bajo", factores };
}
