import Image from "next/image";
import type { ReactNode } from "react";
import { formatFechaLarga, selloDeImpresion } from "@/lib/fecha";

/**
 * Marco común de los documentos imprimibles. En pantalla se ve como una tarjeta
 * más del tema oscuro; al imprimir, el bloque `@media print` de `globals.css` la
 * pasa a papel blanco con tinta negra.
 *
 * No usa `<header>` ni `<footer>`: esas etiquetas las esconde la hoja de estilos
 * de impresión, que es como se quitan el nav y el pie de la app.
 */
export function Hoja({
  titulo,
  fecha,
  resumen,
  children,
}: {
  titulo: string;
  fecha: string;
  /** Línea corta bajo el título: totales o alcance del documento. */
  resumen?: string;
  children: ReactNode;
}) {
  return (
    <article className="hoja rounded-2xl border border-borde bg-superficie p-6 shadow-sm shadow-black/40 print:rounded-none print:border-0 print:bg-transparent print:p-0 print:shadow-none">
      <div className="hoja-encabezado mb-6 flex items-center gap-4 border-b border-borde pb-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-borde print:ring-0">
          <Image
            src="/escudo-ufm.png"
            alt="Escudo de la Universidad Francisco Marroquín"
            width={38}
            height={48}
          />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-texto-suave uppercase">
            Centro de salud Bárbara
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-texto">{titulo}</h2>
          <p className="text-sm text-texto-suave">
            {formatFechaLarga(fecha)}
            {resumen ? ` · ${resumen}` : ""}
          </p>
        </div>
      </div>

      {children}

      <p
        className="hoja-pie mt-6 border-t border-borde pt-3 text-xs text-texto-suave"
        suppressHydrationWarning
      >
        Sistema de Citas · impreso el {selloDeImpresion()}
      </p>
    </article>
  );
}

/** Sección con título y conteo, reusada por las dos hojas. */
export function BloqueHoja({
  titulo,
  conteo,
  saltoDePagina,
  children,
}: {
  titulo: string;
  conteo: number;
  saltoDePagina?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={saltoDePagina ? "salto-pagina mb-8 last:mb-0" : "evitar-corte mb-6 last:mb-0"}
    >
      <h3 className="mb-2 flex items-baseline gap-2 text-sm font-semibold tracking-wide text-texto uppercase">
        {titulo}
        <span className="text-xs font-normal normal-case text-texto-suave">
          {conteo} {conteo === 1 ? "paciente" : "pacientes"}
        </span>
      </h3>
      {children}
    </section>
  );
}
