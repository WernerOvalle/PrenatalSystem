"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useControles, usePacientes } from "@/lib/store";
import { nombreCompleto, ultimoControl } from "@/lib/derive";
import { edadAnios, edadGestacional } from "@/lib/gestational";
import { evaluarRiesgo } from "@/lib/risk";
import { ChevronRight, Search, UserPlus, Users } from "@/components/icons";
import { Badge, Button, Card, EmptyState, Input, PageHeader, RiskBadge } from "@/components/ui";

export default function ListaPacientesPage() {
  const pacientes = usePacientes();
  const controles = useControles();
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const ordenadas = [...pacientes].sort((a, b) =>
      nombreCompleto(a).localeCompare(nombreCompleto(b), "es"),
    );
    if (!q) return ordenadas;
    return ordenadas.filter(
      (p) =>
        nombreCompleto(p).toLowerCase().includes(q) ||
        p.documento.toLowerCase().includes(q),
    );
  }, [pacientes, busqueda]);

  return (
    <div>
      <PageHeader
        icon={<Users width={22} height={22} />}
        title="Gestantes"
        subtitle={`${pacientes.length} registrada${pacientes.length === 1 ? "" : "s"}`}
        action={
          <Link href="/pacientes/nueva">
            <Button>
              <UserPlus width={18} height={18} />
              Nueva gestante
            </Button>
          </Link>
        }
      />

      {pacientes.length === 0 ? (
        <EmptyState
          icon={<Users width={26} height={26} />}
          title="Aún no hay gestantes"
          description="Registra a la primera gestante para empezar su control prenatal."
          action={
            <Link href="/pacientes/nueva">
              <Button>
                <UserPlus width={18} height={18} />
                Registrar gestante
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="relative mb-5 max-w-md">
            <Search
              width={18}
              height={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Buscar por nombre o documento…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          {filtradas.length === 0 ? (
            <EmptyState
              icon={<Search width={26} height={26} />}
              title="Sin resultados"
              description={`No se encontraron gestantes para "${busqueda}".`}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtradas.map((p) => {
                const eg = edadGestacional(p.fum);
                const riesgo = evaluarRiesgo(p, ultimoControl(controles, p.id));
                const edad = edadAnios(p.fechaNacimiento);
                return (
                  <Link key={p.id} href={`/pacientes/detalle/?id=${p.id}`}>
                    <Card className="group p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 text-sm font-semibold text-rose-600">
                          {iniciales(p.nombres, p.apellidos)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-semibold text-slate-800">
                              {nombreCompleto(p)}
                            </span>
                            <ChevronRight
                              width={18}
                              height={18}
                              className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5"
                            />
                          </div>
                          <div className="truncate text-sm text-slate-500">
                            {p.documento || "Sin documento"}
                            {edad !== null && ` · ${edad} años`}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {eg ? (
                          <Badge tone="sky">{eg.texto} semanas</Badge>
                        ) : (
                          <Badge tone="slate">EG no disponible</Badge>
                        )}
                        <RiskBadge nivel={riesgo.nivel} />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function iniciales(nombres: string, apellidos: string): string {
  const a = nombres.trim()[0] ?? "";
  const b = apellidos.trim()[0] ?? "";
  return (a + b).toUpperCase() || "?";
}
