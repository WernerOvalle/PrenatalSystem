"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { CATEGORIAS, citasDeFecha, esCategoria, ordenarAgenda } from "@/lib/citas";
import { formatFechaLarga, hoyISO } from "@/lib/fecha";
import { useCitas } from "@/lib/store";
import { CitaFila } from "@/components/CitaFila";
import { ArrowLeft, CalendarHeart, ClipboardList, Plus, Printer } from "@/components/icons";
import { Card, EmptyState, Input, PageHeader, claseBoton, cn } from "@/components/ui";

export default function AgendaPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-texto-suave">Cargando…</div>}>
      <Agenda />
    </Suspense>
  );
}

function Agenda() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citas = useCitas();

  const fecha = searchParams.get("fecha") || hoyISO();
  const catParam = searchParams.get("cat");
  const categoria = esCategoria(catParam) ? catParam : undefined;

  const delDia = useMemo(
    () => ordenarAgenda(citasDeFecha(citas, fecha, categoria)),
    [citas, fecha, categoria],
  );

  function irA(nuevaFecha: string, nuevaCat: string | undefined) {
    const params = new URLSearchParams({ fecha: nuevaFecha });
    if (nuevaCat) params.set("cat", nuevaCat);
    router.replace(`/agenda/?${params.toString()}`);
  }

  const metaCat = categoria ? CATEGORIAS.find((c) => c.slug === categoria) : undefined;

  return (
    <div>
      {metaCat && (
        <Link
          href={`/calendario/${metaCat.slug}/?mes=${fecha.slice(0, 7)}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-texto-suave transition-colors hover:text-ufm-300"
        >
          <ArrowLeft width={16} height={16} />
          Calendario de {metaCat.label}
        </Link>
      )}

      <PageHeader
        icon={<CalendarHeart width={22} height={22} />}
        title={formatFechaLarga(fecha)}
        subtitle={`${delDia.length} ${delDia.length === 1 ? "cita" : "citas"} · ${
          metaCat ? metaCat.label : "todas las categorías"
        }`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/reportes/?fecha=${fecha}&doc=lista`} className={claseBoton("secondary")}>
              <Printer width={18} height={18} />
              Imprimir
            </Link>
            <Link
              href={`/?accion=nueva&fecha=${fecha}${categoria ? `&cat=${categoria}` : ""}`}
              className={claseBoton()}
            >
              <Plus width={18} height={18} />
              Nueva cita
            </Link>
          </div>
        }
      />

      <Card className="mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-texto">Fecha</span>
          <Input
            type="date"
            value={fecha}
            onChange={(e) => irA(e.target.value || hoyISO(), categoria)}
            className="sm:w-56"
          />
        </label>

        <div className="flex flex-wrap gap-1.5">
          <FiltroCategoria
            label="Todas"
            activo={categoria === undefined}
            onClick={() => irA(fecha, undefined)}
          />
          {CATEGORIAS.map((c) => (
            <FiltroCategoria
              key={c.slug}
              label={c.label}
              activo={categoria === c.slug}
              onClick={() => irA(fecha, c.slug)}
            />
          ))}
        </div>
      </Card>

      {delDia.length === 0 ? (
        <EmptyState
          icon={<ClipboardList width={26} height={26} />}
          title="No hay citas este día"
          description="Agenda una cita para esta fecha o elige otro día en el calendario."
          action={
            <Link
              href={`/?accion=nueva&fecha=${fecha}${categoria ? `&cat=${categoria}` : ""}`}
              className={claseBoton()}
            >
              <Plus width={18} height={18} />
              Generar nueva cita
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {delDia.map((cita) => (
            <li key={cita.id}>
              <CitaFila cita={cita} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FiltroCategoria({
  label,
  activo,
  onClick,
}: {
  label: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        activo
          ? "bg-ufm-600 text-white"
          : "border border-borde bg-superficie-alta text-texto-suave hover:text-texto",
      )}
    >
      {label}
    </button>
  );
}
