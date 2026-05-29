"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { crearPaciente } from "@/lib/store";
import { hoyISO } from "@/lib/derive";
import { ArrowLeft, UserPlus } from "@/components/icons";
import {
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  PageHeader,
  Select,
} from "@/components/ui";

const GRUPOS = ["", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

type Errores = Partial<Record<"nombres" | "apellidos" | "documento" | "fechaNacimiento" | "fum", string>>;

function numOrNull(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function numOrZero(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export default function NuevaPacientePage() {
  const router = useRouter();
  const hoy = hoyISO();

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    documento: "",
    fechaNacimiento: "",
    telefono: "",
    direccion: "",
    grupoSanguineo: "",
    fum: "",
    tallaCm: "",
    pesoPrevioKg: "",
    hipertension: false,
    diabetes: false,
    cesareaPrevia: false,
    embarazoMultiple: false,
    gestaciones: "",
    partos: "",
    abortos: "",
  });
  const [errores, setErrores] = useState<Errores>({});

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validar(): boolean {
    const e: Errores = {};
    if (!form.nombres.trim()) e.nombres = "Ingresa los nombres.";
    if (!form.apellidos.trim()) e.apellidos = "Ingresa los apellidos.";
    if (!form.documento.trim()) e.documento = "Ingresa el documento.";
    if (!form.fechaNacimiento) e.fechaNacimiento = "Selecciona la fecha de nacimiento.";
    else if (form.fechaNacimiento > hoy) e.fechaNacimiento = "No puede ser una fecha futura.";
    if (!form.fum) e.fum = "Selecciona la fecha de la última menstruación (FUM).";
    else if (form.fum > hoy) e.fum = "La FUM no puede ser futura.";
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validar()) return;
    const paciente = crearPaciente({
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      documento: form.documento.trim(),
      fechaNacimiento: form.fechaNacimiento,
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      grupoSanguineo: form.grupoSanguineo,
      fum: form.fum,
      tallaCm: numOrNull(form.tallaCm),
      pesoPrevioKg: numOrNull(form.pesoPrevioKg),
      antecedentes: {
        hipertension: form.hipertension,
        diabetes: form.diabetes,
        cesareaPrevia: form.cesareaPrevia,
        embarazoMultiple: form.embarazoMultiple,
        gestaciones: numOrZero(form.gestaciones),
        partos: numOrZero(form.partos),
        abortos: numOrZero(form.abortos),
      },
    });
    router.push(`/pacientes/detalle/?id=${paciente.id}`);
  }

  return (
    <div>
      <Link
        href="/pacientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft width={16} height={16} />
        Gestantes
      </Link>

      <PageHeader
        icon={<UserPlus width={22} height={22} />}
        title="Nueva gestante"
        subtitle="Registra los datos para iniciar el control prenatal"
      />

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Datos personales
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombres" required error={errores.nombres}>
              <Input
                value={form.nombres}
                onChange={(e) => set("nombres", e.target.value)}
                invalid={!!errores.nombres}
                placeholder="María José"
              />
            </Field>
            <Field label="Apellidos" required error={errores.apellidos}>
              <Input
                value={form.apellidos}
                onChange={(e) => set("apellidos", e.target.value)}
                invalid={!!errores.apellidos}
                placeholder="Pérez Gómez"
              />
            </Field>
            <Field label="Documento de identidad" required error={errores.documento}>
              <Input
                value={form.documento}
                onChange={(e) => set("documento", e.target.value)}
                invalid={!!errores.documento}
                placeholder="0000000000"
                inputMode="numeric"
              />
            </Field>
            <Field label="Fecha de nacimiento" required error={errores.fechaNacimiento}>
              <Input
                type="date"
                max={hoy}
                value={form.fechaNacimiento}
                onChange={(e) => set("fechaNacimiento", e.target.value)}
                invalid={!!errores.fechaNacimiento}
              />
            </Field>
            <Field label="Teléfono">
              <Input
                value={form.telefono}
                onChange={(e) => set("telefono", e.target.value)}
                placeholder="+000 000 0000"
                inputMode="tel"
              />
            </Field>
            <Field label="Dirección" className="sm:col-span-2">
              <Input
                value={form.direccion}
                onChange={(e) => set("direccion", e.target.value)}
                placeholder="Calle, ciudad…"
              />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Datos obstétricos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="FUM" required error={errores.fum} hint="Última menstruación" className="lg:col-span-2">
              <Input
                type="date"
                max={hoy}
                value={form.fum}
                onChange={(e) => set("fum", e.target.value)}
                invalid={!!errores.fum}
              />
            </Field>
            <Field label="Grupo sanguíneo">
              <Select
                value={form.grupoSanguineo}
                onChange={(e) => set("grupoSanguineo", e.target.value)}
              >
                {GRUPOS.map((g) => (
                  <option key={g} value={g}>
                    {g || "—"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Talla (cm)">
              <Input
                type="number"
                min={0}
                value={form.tallaCm}
                onChange={(e) => set("tallaCm", e.target.value)}
                placeholder="160"
              />
            </Field>
            <Field label="Peso previo (kg)">
              <Input
                type="number"
                min={0}
                step="0.1"
                value={form.pesoPrevioKg}
                onChange={(e) => set("pesoPrevioKg", e.target.value)}
                placeholder="60"
              />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Antecedentes
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Checkbox
              label="Hipertensión"
              checked={form.hipertension}
              onChange={(e) => set("hipertension", e.target.checked)}
            />
            <Checkbox
              label="Diabetes"
              checked={form.diabetes}
              onChange={(e) => set("diabetes", e.target.checked)}
            />
            <Checkbox
              label="Cesárea previa"
              checked={form.cesareaPrevia}
              onChange={(e) => set("cesareaPrevia", e.target.checked)}
            />
            <Checkbox
              label="Embarazo múltiple"
              checked={form.embarazoMultiple}
              onChange={(e) => set("embarazoMultiple", e.target.checked)}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Gestaciones previas">
              <Input
                type="number"
                min={0}
                value={form.gestaciones}
                onChange={(e) => set("gestaciones", e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Partos">
              <Input
                type="number"
                min={0}
                value={form.partos}
                onChange={(e) => set("partos", e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Abortos">
              <Input
                type="number"
                min={0}
                value={form.abortos}
                onChange={(e) => set("abortos", e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/pacientes">
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </Link>
          <Button type="submit">
            <UserPlus width={18} height={18} />
            Registrar gestante
          </Button>
        </div>
      </form>
    </div>
  );
}
