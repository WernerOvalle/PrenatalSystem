import type { ComponentType, SVGProps } from "react";
import type { Asistencia, Categoria, EstadoCita } from "@/types";
import {
  Baby,
  Check,
  Clock,
  Eye,
  PhoneMissed,
  PregnantWoman,
  Stethoscope,
  UserCheck,
  UserX,
  X,
} from "./icons";

type Icono = ComponentType<SVGProps<SVGSVGElement>>;

/** Los iconos del prototipo: estetoscopio, bebé y embarazada, más el ojo. */
export const ICONO_CATEGORIA: Record<Categoria, Icono> = {
  "consulta-general": Stethoscope,
  pediatria: Baby,
  prenatal: PregnantWoman,
  oftalmologia: Eye,
};

export const ICONO_ESTADO: Record<EstadoCita, Icono> = {
  pendiente: Clock,
  confirmado: Check,
  "no-contesto": PhoneMissed,
  cancelado: X,
};

export const ICONO_ASISTENCIA: Record<Asistencia, Icono> = {
  "sin-registro": Clock,
  llego: UserCheck,
  "no-llego": UserX,
};
