"use client";

import Link from "next/link";
import { useState } from "react";
import type { Cita } from "@/types";
import { ASISTENCIAS, ESTADOS, metaAsistencia, metaCategoria, metaEstado } from "@/lib/citas";
import { formatFechaCorta, formatHora } from "@/lib/fecha";
import { cambiarAsistencia, cambiarEstadoCita, eliminarCita } from "@/lib/store";
import { CalendarHeart, Phone, Trash } from "./icons";
import { ICONO_ASISTENCIA, ICONO_CATEGORIA, ICONO_ESTADO } from "./iconos-dominio";
import { Badge, Button, Card, claseBoton, cn } from "./ui";

/** Fondo del botón de estado o de asistencia cuando ese valor es el activo. */
const ACTIVO: Record<string, string> = {
  verde: "bg-ufm-verde/25 text-ufm-verde-claro",
  oro: "bg-ufm-oro/20 text-ufm-oro",
  rojo: "bg-ufm-rojo/20 text-ufm-300",
  cancelado: "bg-ufm-700/30 text-ufm-300",
};

const TONO_CATEGORIA: Record<string, string> = {
  azul: "bg-ufm-azul/25 text-ufm-azul-claro",
  oro: "bg-ufm-oro/15 text-ufm-oro",
  rojo: "bg-ufm-rojo/20 text-ufm-300",
  verde: "bg-ufm-verde/20 text-ufm-verde-claro",
};

function Telefono({ label, numero }: { label: string; numero: string }) {
  if (!numero.trim()) {
    return (
      <span className="text-xs text-texto-suave">
        {label}: <span className="text-texto-suave/60">sin número</span>
      </span>
    );
  }
  return (
    <a
      href={`tel:${numero.replace(/\s+/g, "")}`}
      className="flex min-w-0 items-center gap-1.5 text-xs text-texto-suave transition-colors hover:text-ufm-300"
    >
      <Phone width={12} height={12} className="shrink-0" />
      <span className="truncate font-medium text-texto">{numero}</span>
      <span className="shrink-0">· {label}</span>
    </a>
  );
}

export function CitaFila({ cita }: { cita: Cita }) {
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const categoria = metaCategoria(cita.categoria);
  const estado = metaEstado(cita.estado);
  const asistencia = metaAsistencia(cita.asistencia);
  const IconoCategoria = ICONO_CATEGORIA[cita.categoria];
  const IconoEstado = ICONO_ESTADO[cita.estado];
  const IconoAsistencia = ICONO_ASISTENCIA[cita.asistencia];
  const sinCitaPrevia = cita.origen === "nuevo-ingreso";

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
        <div className="flex min-w-0 items-center gap-3 xl:shrink-0 xl:grow xl:basis-[22rem]">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              TONO_CATEGORIA[categoria.tono],
            )}
            title={categoria.label}
          >
            <IconoCategoria width={20} height={20} />
            <span className="sr-only">{categoria.label}</span>
          </span>
          <span className="w-20 shrink-0 text-sm font-semibold tabular-nums text-texto">
            {formatHora(cita.hora)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="max-w-full truncate font-medium text-texto">
                {cita.nombrePaciente || "Sin nombre"}
              </span>
              {sinCitaPrevia && (
                <Badge tono="azul" className="shrink-0">
                  Sin cita previa
                </Badge>
              )}
            </div>
            <div className="truncate text-xs text-texto-suave">
              Expediente {cita.expediente.trim() || "—"}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1 xl:w-52 xl:shrink-0">
          <Telefono label="Paciente" numero={cita.telefonoPaciente} />
          <Telefono label="Familiar" numero={cita.telefonoFamiliar} />
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 xl:grow xl:justify-end">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tono={estado.tono}>
              <IconoEstado width={12} height={12} />
              {estado.label}
            </Badge>
            <Badge tono={asistencia.tono}>
              <IconoAsistencia width={12} height={12} />
              {asistencia.label}
            </Badge>
          </div>

          <div
            className="flex items-center gap-1 rounded-xl border border-borde bg-superficie-alta p-1"
            role="group"
            aria-label="Confirmación telefónica"
          >
            {ESTADOS.filter((e) => e.slug !== "pendiente").map((e) => {
              const Icono = ICONO_ESTADO[e.slug];
              const activo = cita.estado === e.slug;
              return (
                <button
                  key={e.slug}
                  type="button"
                  aria-pressed={activo}
                  title={activo ? `Quitar "${e.label}"` : e.label}
                  onClick={() =>
                    cambiarEstadoCita(cita.id, activo ? "pendiente" : e.slug)
                  }
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    activo
                      ? ACTIVO[e.tono]
                      : "text-texto-suave hover:bg-borde hover:text-texto",
                  )}
                >
                  <Icono width={16} height={16} />
                  <span className="sr-only">{e.label}</span>
                </button>
              );
            })}
          </div>

          <div
            className="flex items-center gap-1 rounded-xl border border-borde bg-superficie-alta p-1"
            role="group"
            aria-label="Asistencia"
          >
            {ASISTENCIAS.filter((a) => a.slug !== "sin-registro").map((a) => {
              const Icono = ICONO_ASISTENCIA[a.slug];
              const activo = cita.asistencia === a.slug;
              return (
                <button
                  key={a.slug}
                  type="button"
                  aria-pressed={activo}
                  title={activo ? `Quitar "${a.label}"` : a.label}
                  onClick={() =>
                    cambiarAsistencia(cita.id, activo ? "sin-registro" : a.slug)
                  }
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors",
                    activo
                      ? ACTIVO[a.tono]
                      : "text-texto-suave hover:bg-borde hover:text-texto",
                  )}
                >
                  <Icono width={16} height={16} />
                  {a.label}
                </button>
              );
            })}
          </div>

          <Link
            href={`/?accion=reprogramar&cita=${cita.id}`}
            className={claseBoton("secondary", "sm")}
          >
            <CalendarHeart width={16} height={16} />
            Reprogramar
          </Link>

          {confirmandoBorrado ? (
            <span className="flex items-center gap-1">
              <Button variant="danger" size="sm" onClick={() => eliminarCita(cita.id)}>
                Eliminar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmandoBorrado(false)}
              >
                Cancelar
              </Button>
            </span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Eliminar cita"
              title="Eliminar cita"
              onClick={() => setConfirmandoBorrado(true)}
            >
              <Trash width={16} height={16} />
            </Button>
          )}
        </div>
      </div>

      {cita.fechaAnterior && (
        <p className="mt-2 border-t border-borde pt-2 text-xs text-texto-suave">
          Reprogramada desde el {formatFechaCorta(cita.fechaAnterior)}
        </p>
      )}
    </Card>
  );
}
