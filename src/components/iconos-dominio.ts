import type { ComponentType, SVGProps } from "react";
import type { Categoria, EstadoCita } from "@/types";
import { Baby, Check, Clock, PhoneMissed, PregnantWoman, Stethoscope, X } from "./icons";

type Icono = ComponentType<SVGProps<SVGSVGElement>>;

/** Los iconos del prototipo: estetoscopio, bebé y embarazada. */
export const ICONO_CATEGORIA: Record<Categoria, Icono> = {
  "consulta-general": Stethoscope,
  pediatria: Baby,
  prenatal: PregnantWoman,
};

export const ICONO_ESTADO: Record<EstadoCita, Icono> = {
  pendiente: Clock,
  confirmado: Check,
  "no-contesto": PhoneMissed,
  cancelado: X,
};
