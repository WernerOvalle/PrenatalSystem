"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { CATEGORIAS, totalesDeFecha } from "@/lib/citas";
import { formatFechaLarga, hoyISO } from "@/lib/fecha";
import { useCitas } from "@/lib/store";
import { ChevronRight, Users } from "@/components/icons";
import { Card, Input, PageHeader, Stat, claseBoton } from "@/components/ui";

export default function TotalesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-texto-suave">Cargando…</div>}>
      <Totales />
    </Suspense>
  );
}

function Totales() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citas = useCitas();

  const fecha = searchParams.get("fecha") || hoyISO();
  const { total, porCategoria } = useMemo(
    () => totalesDeFecha(citas, fecha),
    [citas, fecha],
  );

  /** Mismo orden que el prototipo: total, pediatría, consulta general, prenatal. */
  const filas = [
    { label: "Total pacientes", valor: total, tono: "rojo" as const, href: `/agenda/?fecha=${fecha}` },
    ...(["pediatria", "consulta-general", "prenatal"] as const).map((slug) => {
      const meta = CATEGORIAS.find((c) => c.slug === slug)!;
      return {
        label: `Total ${meta.label.toLowerCase()}`,
        valor: porCategoria[slug],
        tono: meta.tono,
        href: `/agenda/?fecha=${fecha}&cat=${slug}`,
      };
    }),
  ];

  return (
    <div>
      <PageHeader
        icon={<Users width={22} height={22} />}
        title="Todos pacientes"
        subtitle={`Citas agendadas el ${formatFechaLarga(fecha)}`}
      />

      <Card className="mb-6 p-4">
        <label className="block sm:w-56">
          <span className="mb-1.5 block text-sm font-medium text-texto">Fecha</span>
          <Input
            type="date"
            value={fecha}
            onChange={(e) =>
              router.replace(`/totales/?fecha=${e.target.value || hoyISO()}`)
            }
          />
        </label>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {filas.map((f) => (
          <Link key={f.label} href={f.href} className="group block">
            <Stat
              icon={<span className="text-lg font-semibold">#</span>}
              value={f.valor}
              label={f.label}
              tono={f.tono}
            />
          </Link>
        ))}
      </div>

      <Link
        href={`/agenda/?fecha=${fecha}`}
        className={claseBoton("secondary", "md", "mt-6")}
      >
        Ver la agenda del día
        <ChevronRight width={18} height={18} />
      </Link>
    </div>
  );
}
