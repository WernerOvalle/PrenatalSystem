import { Suspense } from "react";
import type { Categoria } from "@/types";
import { CATEGORIAS, esCategoria } from "@/lib/citas";
import { VistaCalendario } from "@/components/VistaCalendario";

/**
 * Con `output: "export"` las rutas dinámicas solo funcionan si se enumeran acá.
 * Son tres y son fijas, así que el export estático genera una página por
 * categoría.
 */
export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ categoria: c.slug }));
}

export default async function CalendarioPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const slug: Categoria = esCategoria(categoria) ? categoria : "consulta-general";

  return (
    <Suspense fallback={<div className="py-20 text-center text-texto-suave">Cargando…</div>}>
      <VistaCalendario categoria={slug} />
    </Suspense>
  );
}
