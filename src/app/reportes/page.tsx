"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { formatFechaLarga, hoyISO } from "@/lib/fecha";
import { useCitas } from "@/lib/store";
import { HojaLista } from "@/components/HojaLista";
import { HojaResumen } from "@/components/HojaResumen";
import { ClipboardList, FileText, Printer } from "@/components/icons";
import { Button, Card, Input, PageHeader, cn } from "@/components/ui";

type Documento = "lista" | "resumen";

const DOCUMENTOS: { slug: Documento; label: string; descripcion: string }[] = [
  {
    slug: "lista",
    label: "Lista por categoría",
    descripcion: "Los pacientes del día divididos por categoría, uno por página.",
  },
  {
    slug: "resumen",
    label: "Resumen del día",
    descripcion: "Quién llegó y quién no, cruzado con la confirmación telefónica.",
  },
];

export default function ReportesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-texto-suave">Cargando…</div>}>
      <Reportes />
    </Suspense>
  );
}

function Reportes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citas = useCitas();

  const fecha = searchParams.get("fecha") || hoyISO();
  const docParam = searchParams.get("doc");
  const doc: Documento = docParam === "resumen" ? "resumen" : "lista";

  function irA(nuevaFecha: string, nuevoDoc: Documento) {
    router.replace(`/reportes/?fecha=${nuevaFecha}&doc=${nuevoDoc}`);
  }

  const meta = DOCUMENTOS.find((d) => d.slug === doc)!;

  return (
    <div>
      <div className="no-imprimir">
        <PageHeader
          icon={<FileText width={22} height={22} />}
          title="Reportes"
          subtitle={`${meta.label} · ${formatFechaLarga(fecha)}`}
          action={
            <Button onClick={() => window.print()}>
              <Printer width={18} height={18} />
              Imprimir / Guardar PDF
            </Button>
          }
        />

        <Card className="mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="block sm:w-56">
            <span className="mb-1.5 block text-sm font-medium text-texto">Fecha</span>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => irA(e.target.value || hoyISO(), doc)}
            />
          </label>

          <div className="flex flex-wrap gap-1.5">
            {DOCUMENTOS.map((d) => (
              <button
                key={d.slug}
                type="button"
                onClick={() => irA(fecha, d.slug)}
                aria-pressed={doc === d.slug}
                title={d.descripcion}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  doc === d.slug
                    ? "bg-marca-600 text-white"
                    : "border border-borde bg-superficie-alta text-texto-suave hover:text-texto",
                )}
              >
                {d.slug === "lista" ? (
                  <ClipboardList width={14} height={14} className="mr-1.5 inline align-text-bottom" />
                ) : (
                  <FileText width={14} height={14} className="mr-1.5 inline align-text-bottom" />
                )}
                {d.label}
              </button>
            ))}
          </div>
        </Card>

        <p className="mb-4 text-xs text-texto-suave">
          {meta.descripcion} Para guardar el PDF, elige «Guardar como PDF» en el destino del
          diálogo de impresión.
        </p>
      </div>

      {doc === "lista" ? (
        <HojaLista citas={citas} fecha={fecha} />
      ) : (
        <HojaResumen citas={citas} fecha={fecha} />
      )}
    </div>
  );
}
