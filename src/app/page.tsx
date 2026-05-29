"use client";

import Link from "next/link";
import { useControles, usePacientes } from "@/lib/store";
import { enMesActual, hoyISO, nombreCompleto, ultimoControl } from "@/lib/derive";
import { edadGestacional, formatFecha } from "@/lib/gestational";
import { evaluarRiesgo } from "@/lib/risk";
import {
  AlertTriangle,
  CalendarHeart,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  Stethoscope,
  UserPlus,
  Users,
} from "@/components/icons";
import { Badge, Button, Card, EmptyState, PageHeader, RiskBadge, Stat } from "@/components/ui";

export default function PanelPage() {
  const pacientes = usePacientes();
  const controles = useControles();
  const hoy = hoyISO();

  const controlesMes = controles.filter((c) => enMesActual(c.fecha)).length;

  const proximasCitas = controles
    .filter((c) => c.proximaCita && c.proximaCita >= hoy)
    .sort((a, b) => a.proximaCita.localeCompare(b.proximaCita))
    .slice(0, 6)
    .map((c) => ({
      control: c,
      paciente: pacientes.find((p) => p.id === c.pacienteId),
    }))
    .filter((x): x is { control: typeof x.control; paciente: NonNullable<typeof x.paciente> } =>
      Boolean(x.paciente),
    );

  const altoRiesgo = pacientes
    .map((p) => ({ paciente: p, riesgo: evaluarRiesgo(p, ultimoControl(controles, p.id)) }))
    .filter((x) => x.riesgo.nivel === "alto");

  return (
    <div>
      <PageHeader
        icon={<HeartPulse width={22} height={22} />}
        title="Panel general"
        subtitle="Resumen del seguimiento prenatal"
        action={
          <Link href="/pacientes/nueva">
            <Button>
              <UserPlus width={18} height={18} />
              Nueva gestante
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<Users width={22} height={22} />} value={pacientes.length} label="Gestantes" tone="rose" />
        <Stat icon={<Stethoscope width={22} height={22} />} value={controlesMes} label="Controles este mes" tone="sky" />
        <Stat icon={<CalendarHeart width={22} height={22} />} value={proximasCitas.length} label="Próximas citas" tone="violet" />
        <Stat icon={<AlertTriangle width={22} height={22} />} value={altoRiesgo.length} label="Alto riesgo" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <CalendarHeart width={20} height={20} className="text-violet-500" />
            <h2 className="text-base font-semibold text-slate-800">Próximas citas</h2>
          </div>
          {proximasCitas.length === 0 ? (
            <EmptyState
              icon={<CalendarHeart width={24} height={24} />}
              title="Sin citas programadas"
              description="Las próximas citas registradas en los controles aparecerán aquí."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {proximasCitas.map(({ control, paciente }) => (
                <li key={control.id}>
                  <Link
                    href={`/pacientes/detalle/?id=${paciente.id}`}
                    className="-mx-2 flex items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-slate-50"
                  >
                    <div>
                      <div className="font-medium text-slate-800">{nombreCompleto(paciente)}</div>
                      <div className="text-sm text-slate-500">{formatFecha(control.proximaCita)}</div>
                    </div>
                    <ChevronRight width={18} height={18} className="text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle width={20} height={20} className="text-amber-500" />
            <h2 className="text-base font-semibold text-slate-800">Gestantes de alto riesgo</h2>
          </div>
          {altoRiesgo.length === 0 ? (
            <EmptyState
              icon={<HeartPulse width={24} height={24} />}
              title="Sin casos de alto riesgo"
              description="Todas las gestantes registradas están clasificadas como bajo riesgo."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {altoRiesgo.slice(0, 6).map(({ paciente, riesgo }) => {
                const eg = edadGestacional(paciente.fum);
                return (
                  <li key={paciente.id}>
                    <Link
                      href={`/pacientes/detalle/?id=${paciente.id}`}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-800">{nombreCompleto(paciente)}</div>
                        <div className="truncate text-sm text-slate-500">
                          {riesgo.factores[0]}
                          {riesgo.factores.length > 1 && ` · +${riesgo.factores.length - 1} más`}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {eg && <Badge tone="slate">{eg.texto} sem</Badge>}
                        <RiskBadge nivel="alto" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {pacientes.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={<ClipboardList width={26} height={26} />}
            title="Aún no hay gestantes registradas"
            description="Comienza registrando a la primera gestante para llevar su control prenatal."
            action={
              <Link href="/pacientes/nueva">
                <Button>
                  <UserPlus width={18} height={18} />
                  Registrar gestante
                </Button>
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
