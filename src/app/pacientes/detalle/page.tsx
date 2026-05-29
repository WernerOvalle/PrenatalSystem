"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { ControlPrenatal, Paciente } from "@/types";
import { crearControl, eliminarControl, eliminarPaciente, useControles, usePacientes } from "@/lib/store";
import { controlesDe, hoyISO, nombreCompleto, ultimoControl } from "@/lib/derive";
import { edadAnios, edadGestacional, formatFecha, fpp, parseFecha, trimestre } from "@/lib/gestational";
import { evaluarRiesgo } from "@/lib/risk";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Baby,
  CalendarHeart,
  Droplet,
  Gauge,
  Phone,
  Plus,
  Ruler,
  Stethoscope,
  Trash,
  Weight,
  X,
} from "@/components/icons";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Input,
  RiskBadge,
  Textarea,
} from "@/components/ui";

const TRIMESTRE_LABEL: Record<number, string> = {
  1: "Primer trimestre",
  2: "Segundo trimestre",
  3: "Tercer trimestre",
};

export default function DetallePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Cargando…</div>}>
      <DetalleInner />
    </Suspense>
  );
}

function DetalleInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const pacientes = usePacientes();
  const controles = useControles();
  const [mostrarForm, setMostrarForm] = useState(false);

  const paciente = pacientes.find((p) => p.id === id);

  if (!paciente) {
    return (
      <div>
        <BackLink />
        <EmptyState
          icon={<AlertTriangle width={26} height={26} />}
          title="Gestante no encontrada"
          description="El registro no existe o fue eliminado."
          action={
            <Link href="/pacientes">
              <Button variant="secondary">Volver a la lista</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const historial = controlesDe(controles, paciente.id);
  const eg = edadGestacional(paciente.fum);
  const tri = trimestre(paciente.fum);
  const fppDate = fpp(paciente.fum);
  const edad = edadAnios(paciente.fechaNacimiento);
  const riesgo = evaluarRiesgo(paciente, ultimoControl(controles, paciente.id));

  function onEliminarPaciente() {
    if (window.confirm(`¿Eliminar a ${nombreCompleto(paciente!)} y todos sus controles?`)) {
      eliminarPaciente(paciente!.id);
      router.push("/pacientes");
    }
  }

  return (
    <div>
      <BackLink />

      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-lg font-semibold text-white shadow-sm shadow-rose-300/50">
              {iniciales(paciente)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {nombreCompleto(paciente)}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span>Doc. {paciente.documento || "—"}</span>
                {edad !== null && <span>{edad} años</span>}
                {paciente.telefono && (
                  <span className="inline-flex items-center gap-1">
                    <Phone width={14} height={14} /> {paciente.telefono}
                  </span>
                )}
                {paciente.grupoSanguineo && (
                  <span className="inline-flex items-center gap-1">
                    <Droplet width={14} height={14} /> {paciente.grupoSanguineo}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={onEliminarPaciente} className="self-start">
            <Trash width={16} height={16} />
            Eliminar
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ResumenCard
          icon={<Baby width={20} height={20} />}
          tone="rose"
          label="Edad gestacional"
          value={eg ? `${eg.texto} sem` : "—"}
        />
        <ResumenCard
          icon={<CalendarHeart width={20} height={20} />}
          tone="violet"
          label="Fecha probable de parto"
          value={fppDate ? formatFecha(fppDate) : "—"}
        />
        <ResumenCard
          icon={<Activity width={20} height={20} />}
          tone="sky"
          label="Trimestre"
          value={tri ? TRIMESTRE_LABEL[tri] : "—"}
        />
        <ResumenCard
          icon={<AlertTriangle width={20} height={20} />}
          tone={riesgo.nivel === "alto" ? "amber" : "emerald"}
          label="Clasificación"
          value={<RiskBadge nivel={riesgo.nivel} />}
        />
      </div>

      {riesgo.factores.length > 0 && (
        <Card className="mt-4 border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle width={20} height={20} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Factores de riesgo</p>
              <ul className="mt-1 list-inside list-disc text-sm text-amber-700">
                {riesgo.factores.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-4 mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope width={20} height={20} className="text-rose-500" />
          <h2 className="text-lg font-semibold text-slate-800">Controles prenatales</h2>
          <Badge tone="slate">{historial.length}</Badge>
        </div>
        <Button size="sm" variant={mostrarForm ? "secondary" : "primary"} onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? <X width={16} height={16} /> : <Plus width={16} height={16} />}
          {mostrarForm ? "Cerrar" : "Nuevo control"}
        </Button>
      </div>

      {mostrarForm && (
        <NuevoControlForm
          pacienteId={paciente.id}
          onListo={() => setMostrarForm(false)}
        />
      )}

      {historial.length === 0 ? (
        <EmptyState
          icon={<Stethoscope width={26} height={26} />}
          title="Sin controles registrados"
          description="Registra el primer control prenatal para comenzar el seguimiento."
        />
      ) : (
        <div className="space-y-3">
          {historial.map((c) => (
            <ControlCard key={c.id} control={c} paciente={paciente} />
          ))}
        </div>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/pacientes"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
    >
      <ArrowLeft width={16} height={16} />
      Gestantes
    </Link>
  );
}

function ResumenCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone: "rose" | "sky" | "emerald" | "amber" | "violet";
}) {
  const tones: Record<string, string> = {
    rose: "bg-rose-100 text-rose-600",
    sky: "bg-sky-100 text-sky-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    violet: "bg-violet-100 text-violet-600",
  };
  return (
    <Card className="p-4">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-slate-900">{value}</div>
    </Card>
  );
}

function ControlCard({ control, paciente }: { control: ControlPrenatal; paciente: Paciente }) {
  const egEnFecha = paciente.fum
    ? edadGestacional(paciente.fum, parseFecha(control.fecha) ?? new Date())
    : null;
  const pa =
    control.presionSistolica !== null && control.presionDiastolica !== null
      ? `${control.presionSistolica}/${control.presionDiastolica}`
      : "—";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{formatFecha(control.fecha)}</span>
          {egEnFecha && <Badge tone="sky">{egEnFecha.texto} sem</Badge>}
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Eliminar este control?")) eliminarControl(control.id);
          }}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          aria-label="Eliminar control"
        >
          <Trash width={16} height={16} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={<Weight width={16} height={16} />} label="Peso" value={control.pesoKg !== null ? `${control.pesoKg} kg` : "—"} />
        <Metric icon={<Gauge width={16} height={16} />} label="Presión" value={pa !== "—" ? `${pa} mmHg` : "—"} />
        <Metric icon={<Ruler width={16} height={16} />} label="Altura uterina" value={control.alturaUterinaCm !== null ? `${control.alturaUterinaCm} cm` : "—"} />
        <Metric icon={<Activity width={16} height={16} />} label="FCF" value={control.fcfLpm !== null ? `${control.fcfLpm} lpm` : "—"} />
      </div>

      {(control.movimientosFetales || control.edemas || control.proximaCita || control.observaciones) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {control.movimientosFetales && <Badge tone="emerald">Movimientos fetales +</Badge>}
          {control.edemas && <Badge tone="amber">Edemas</Badge>}
          {control.proximaCita && (
            <Badge tone="violet">
              <CalendarHeart width={12} height={12} /> Próxima: {formatFecha(control.proximaCita)}
            </Badge>
          )}
        </div>
      )}

      {control.observaciones && (
        <p className="mt-3 text-sm text-slate-600">{control.observaciones}</p>
      )}
    </Card>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </span>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-medium text-slate-800">{value}</div>
      </div>
    </div>
  );
}

function numOrNull(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function NuevoControlForm({ pacienteId, onListo }: { pacienteId: string; onListo: () => void }) {
  const hoy = hoyISO();
  const [form, setForm] = useState({
    fecha: hoy,
    pesoKg: "",
    presionSistolica: "",
    presionDiastolica: "",
    alturaUterinaCm: "",
    fcfLpm: "",
    movimientosFetales: false,
    edemas: false,
    observaciones: "",
    proximaCita: "",
  });
  const [errorFecha, setErrorFecha] = useState<string>();

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.fecha) {
      setErrorFecha("Selecciona la fecha del control.");
      return;
    }
    crearControl({
      pacienteId,
      fecha: form.fecha,
      pesoKg: numOrNull(form.pesoKg),
      presionSistolica: numOrNull(form.presionSistolica),
      presionDiastolica: numOrNull(form.presionDiastolica),
      alturaUterinaCm: numOrNull(form.alturaUterinaCm),
      fcfLpm: numOrNull(form.fcfLpm),
      movimientosFetales: form.movimientosFetales,
      edemas: form.edemas,
      observaciones: form.observaciones.trim(),
      proximaCita: form.proximaCita,
    });
    onListo();
  }

  return (
    <Card className="mb-4 border-rose-200 bg-rose-50/40 p-6">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Fecha del control" required error={errorFecha}>
            <Input type="date" max={hoy} value={form.fecha} onChange={(e) => set("fecha", e.target.value)} invalid={!!errorFecha} />
          </Field>
          <Field label="Peso (kg)">
            <Input type="number" min={0} step="0.1" value={form.pesoKg} onChange={(e) => set("pesoKg", e.target.value)} placeholder="65" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="P. sistólica">
              <Input type="number" min={0} value={form.presionSistolica} onChange={(e) => set("presionSistolica", e.target.value)} placeholder="120" />
            </Field>
            <Field label="P. diastólica">
              <Input type="number" min={0} value={form.presionDiastolica} onChange={(e) => set("presionDiastolica", e.target.value)} placeholder="80" />
            </Field>
          </div>
          <Field label="Altura uterina (cm)">
            <Input type="number" min={0} step="0.1" value={form.alturaUterinaCm} onChange={(e) => set("alturaUterinaCm", e.target.value)} placeholder="28" />
          </Field>
          <Field label="FCF (lpm)" hint="Frecuencia cardíaca fetal">
            <Input type="number" min={0} value={form.fcfLpm} onChange={(e) => set("fcfLpm", e.target.value)} placeholder="140" />
          </Field>
          <Field label="Próxima cita">
            <Input type="date" min={hoy} value={form.proximaCita} onChange={(e) => set("proximaCita", e.target.value)} />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox label="Movimientos fetales presentes" checked={form.movimientosFetales} onChange={(e) => set("movimientosFetales", e.target.checked)} />
          <Checkbox label="Presencia de edemas" checked={form.edemas} onChange={(e) => set("edemas", e.target.checked)} />
        </div>

        <Field label="Observaciones">
          <Textarea value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)} placeholder="Notas del control, indicaciones…" />
        </Field>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={onListo}>
            Cancelar
          </Button>
          <Button type="submit" size="sm">
            <Plus width={16} height={16} />
            Guardar control
          </Button>
        </div>
      </form>
    </Card>
  );
}

function iniciales(p: Paciente): string {
  const a = p.nombres.trim()[0] ?? "";
  const b = p.apellidos.trim()[0] ?? "";
  return (a + b).toUpperCase() || "?";
}
