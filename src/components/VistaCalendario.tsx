"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { Categoria } from "@/types";
import { conteoPorDia, metaCategoria } from "@/lib/citas";
import { nombreMes, parseMesISO } from "@/lib/fecha";
import { useCitas } from "@/lib/store";
import { Calendario } from "./Calendario";
import { Plus } from "./icons";
import { ICONO_CATEGORIA } from "./iconos-dominio";
import { PageHeader, claseBoton } from "./ui";

export function VistaCalendario({ categoria }: { categoria: Categoria }) {
  const searchParams = useSearchParams();
  const { anio, mes } = parseMesISO(searchParams.get("mes"));
  const citas = useCitas();

  const conteo = useMemo(
    () => conteoPorDia(citas, anio, mes, categoria),
    [citas, anio, mes, categoria],
  );
  const totalMes = Object.values(conteo).reduce((a, b) => a + b, 0);

  const meta = metaCategoria(categoria);
  const Icono = ICONO_CATEGORIA[categoria];

  return (
    <div>
      <PageHeader
        icon={<Icono width={22} height={22} />}
        title={meta.label}
        subtitle={`${totalMes} ${totalMes === 1 ? "cita" : "citas"} en ${nombreMes(mes)} ${anio}`}
        action={
          <Link href={`/?accion=nueva&cat=${categoria}`} className={claseBoton()}>
            <Plus width={18} height={18} />
            Nueva cita
          </Link>
        }
      />

      <Calendario categoria={categoria} anio={anio} mes={mes} conteo={conteo} />

      <p className="mt-3 text-xs text-texto-suave">
        El número en cada día son las citas agendadas. Elige un día para abrir su agenda.
      </p>
    </div>
  );
}
