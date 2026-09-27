"use client";

import Link from "next/link";
import type { Categoria } from "@/types";
import {
  DIAS_SEMANA,
  aMesISO,
  hoyISO,
  matrizMes,
  mesAnterior,
  mesSiguiente,
  tituloMes,
} from "@/lib/fecha";
import { Bell, ChevronLeft, ChevronRight } from "./icons";
import { Card, cn } from "./ui";

export function Calendario({
  categoria,
  anio,
  mes,
  conteo,
}: {
  categoria: Categoria;
  anio: number;
  mes: number;
  /** Citas por día en formato ISO, para los contadores de cada celda. */
  conteo: Record<string, number>;
}) {
  const semanas = matrizMes(anio, mes);
  const hoy = hoyISO();
  const anterior = mesAnterior(anio, mes);
  const siguiente = mesSiguiente(anio, mes);
  const base = `/calendario/${categoria}/`;

  const flechaClase =
    "flex h-9 w-9 items-center justify-center rounded-xl text-texto-suave transition-colors hover:bg-superficie-alta hover:text-texto";

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3">
        <Link
          href={`${base}?mes=${aMesISO(anterior.anio, anterior.mes)}`}
          aria-label="Mes anterior"
          className={flechaClase}
        >
          <ChevronLeft width={20} height={20} />
        </Link>
        <h2 className="text-lg font-semibold tracking-wide text-texto">
          {tituloMes(anio, mes)}
        </h2>
        <Link
          href={`${base}?mes=${aMesISO(siguiente.anio, siguiente.mes)}`}
          aria-label="Mes siguiente"
          className={flechaClase}
        >
          <ChevronRight width={20} height={20} />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-px bg-borde">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="bg-superficie-alta px-1 py-2 text-center text-xs font-semibold tracking-wider text-texto-suave"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-borde">
        {semanas.flat().map((dia) => {
          const n = conteo[dia.iso] ?? 0;
          const esHoy = dia.iso === hoy;
          return (
            <Link
              key={dia.iso}
              href={`/agenda/?fecha=${dia.iso}&cat=${categoria}`}
              className={cn(
                "flex h-20 flex-col justify-between p-1.5 transition-colors sm:h-24 sm:p-2",
                dia.esDelMes
                  ? "bg-superficie hover:bg-superficie-alta"
                  : "bg-fondo/60 hover:bg-superficie-alta/70",
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  esHoy
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-marca-oro font-semibold text-fondo"
                    : dia.esDelMes
                      ? "font-medium text-texto"
                      : "text-texto-suave/50",
                )}
              >
                {dia.dia}
              </span>
              {n > 0 && (
                <span className="inline-flex items-center gap-1 self-start rounded-full bg-marca-rojo/20 px-1.5 py-0.5 text-xs font-semibold text-marca-300 ring-1 ring-inset ring-marca-rojo/50">
                  <Bell width={12} height={12} />
                  {n}
                  <span className="sr-only">
                    {n === 1 ? "cita agendada" : "citas agendadas"}
                  </span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
