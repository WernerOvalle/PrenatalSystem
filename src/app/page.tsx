"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import type { Categoria, Cita } from "@/types";
import {
  CATEGORIAS,
  esCategoria,
  llegadosDeFecha,
  metaCategoria,
  nombresConocidos,
  totalesDeFecha,
  pendientesDeHoy,
} from "@/lib/citas";
import {
  formatFechaCorta,
  formatFechaLarga,
  formatHora,
  horaActual,
  hoyISO,
} from "@/lib/fecha";
import { crearCita, reprogramarCita, useCitas } from "@/lib/store";
import {
  AlertTriangle,
  Bell,
  CalendarHeart,
  Check,
  ClipboardList,
  DoorOpen,
  Plus,
  UserCheck,
} from "@/components/icons";
import { ICONO_CATEGORIA } from "@/components/iconos-dominio";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Select,
  Stat,
  claseBoton,
  cn,
} from "@/components/ui";

type Accion = "nueva" | "reprogramar" | "ingreso";

const ACCIONES: readonly Accion[] = ["nueva", "reprogramar", "ingreso"];

export default function InicioPage() {
  return (
    <Suspense
      fallback={<div className="py-20 text-center text-texto-suave">Cargando…</div>}
    >
      <Inicio />
    </Suspense>
  );
}

function Inicio() {
  const searchParams = useSearchParams();
  const accionParam = searchParams.get("accion");
  const accion: Accion | null = ACCIONES.includes(accionParam as Accion)
    ? (accionParam as Accion)
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <div className="flex flex-col gap-4">
        <Link
          href="/?accion=nueva"
          aria-current={accion === "nueva" ? "page" : undefined}
          className={claseBoton(accion === "nueva" ? "primary" : "secondary", "grande")}
        >
          <Plus width={20} height={20} />
          Generar nueva cita
        </Link>
        <Link
          href="/?accion=reprogramar"
          aria-current={accion === "reprogramar" ? "page" : undefined}
          className={claseBoton(
            accion === "reprogramar" ? "primary" : "secondary",
            "grande",
          )}
        >
          <CalendarHeart width={20} height={20} />
          Reprogramar
        </Link>
        <Link
          href="/?accion=ingreso"
          aria-current={accion === "ingreso" ? "page" : undefined}
          className={claseBoton(accion === "ingreso" ? "primary" : "secondary", "grande")}
        >
          <DoorOpen width={20} height={20} />
          Nuevo ingreso
        </Link>
      </div>

      {accion === "nueva" ? (
        <FormNuevaCita />
      ) : accion === "reprogramar" ? (
        <FormReprogramar />
      ) : accion === "ingreso" ? (
        <FormNuevoIngreso />
      ) : (
        <Bienvenida />
      )}
    </div>
  );
}

function Bienvenida() {
  const citas = useCitas();
  const hoy = hoyISO();
  const { total, porCategoria } = totalesDeFecha(citas, hoy);
  const pendientes = pendientesDeHoy(citas, hoy);
  const confirmadas = citas.filter(
    (c) => c.fecha === hoy && c.estado === "confirmado",
  ).length;
  const llegaron = llegadosDeFecha(citas, hoy);

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-borde">
          <Image
            src="/escudo-ufm.png"
            alt="Escudo de la Universidad Francisco Marroquín"
            width={56}
            height={71}
            priority
          />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-texto">
            Sistema de Citas
          </h1>
          <p className="mt-1 text-sm text-texto-suave">
            Centro de salud Bárbara · consulta general, pediatría, prenatal y oftalmología.
          </p>
          <p className="mt-3 text-sm text-texto-suave">
            Hoy es <span className="font-medium text-texto">{formatFechaLarga(hoy)}</span>.
          </p>
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-texto-suave uppercase">
            Citas de hoy
          </h2>
          <Link
            href={`/reportes/?fecha=${hoy}&doc=resumen`}
            className="text-sm text-texto-suave transition-colors hover:text-ufm-300"
          >
            Ver reporte del día →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            icon={<ClipboardList width={22} height={22} />}
            value={total}
            label="Agendadas"
            tono="gris"
          />
          <Stat
            icon={<Bell width={22} height={22} />}
            value={pendientes}
            label="Sin confirmar"
            tono="rojo"
          />
          <Stat
            icon={<Check width={22} height={22} />}
            value={confirmadas}
            label="Confirmadas"
            tono="oro"
          />
          <Stat
            icon={<UserCheck width={22} height={22} />}
            value={llegaron}
            label="Llegaron"
            tono="verde"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIAS.map((c) => {
          const Icono = ICONO_CATEGORIA[c.slug];
          return (
            <Link key={c.slug} href={`/calendario/${c.slug}/`}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:border-ufm-700">
                <Icono width={20} height={20} className="shrink-0 text-texto-suave" />
                <span className="text-sm font-medium text-texto">{c.label}</span>
                <Badge tono={c.tono} className="ml-auto">
                  {porCategoria[c.slug]}
                </Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function FormNuevaCita() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citas = useCitas();
  const catInicial = searchParams.get("cat");

  const [nombrePaciente, setNombre] = useState("");
  const [expediente, setExpediente] = useState("");
  const [fecha, setFecha] = useState(searchParams.get("fecha") ?? hoyISO());
  const [hora, setHora] = useState("");
  const [telefonoPaciente, setTelPaciente] = useState("");
  const [telefonoFamiliar, setTelFamiliar] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "">(
    esCategoria(catInicial) ? catInicial : "",
  );
  const [errores, setErrores] = useState<Record<string, string>>({});

  const nombres = useMemo(() => nombresConocidos(citas), [citas]);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const nuevos: Record<string, string> = {};
    if (!nombrePaciente.trim()) nuevos.nombrePaciente = "Escribe el nombre del paciente.";
    if (!fecha) nuevos.fecha = "Elige la fecha de la cita.";
    if (!hora) nuevos.hora = "Elige la hora de la cita.";
    if (!categoria) nuevos.categoria = "Elige una categoría.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    crearCita({
      nombrePaciente: nombrePaciente.trim(),
      expediente: expediente.trim(),
      telefonoPaciente: telefonoPaciente.trim(),
      telefonoFamiliar: telefonoFamiliar.trim(),
      categoria: categoria as Categoria,
      fecha,
      hora,
    });
    router.push(`/agenda/?fecha=${fecha}&cat=${categoria}`);
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-texto">
        Generar nueva cita
      </h2>
      <form onSubmit={enviar} className="grid gap-4" noValidate>
        <Field label="Nombre paciente" required error={errores.nombrePaciente}>
          <Input
            value={nombrePaciente}
            onChange={(e) => setNombre(e.target.value)}
            list="nombres-conocidos"
            autoComplete="off"
            placeholder="Nombre y apellidos"
            invalid={Boolean(errores.nombrePaciente)}
          />
          <datalist id="nombres-conocidos">
            {nombres.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>

        <Field label="# Expediente">
          <Input
            value={expediente}
            onChange={(e) => setExpediente(e.target.value)}
            placeholder="Ej. 2026-0184"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Fecha de la cita"
            required
            hint={fecha ? formatFechaLarga(fecha) : undefined}
            error={errores.fecha}
          >
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              invalid={Boolean(errores.fecha)}
            />
          </Field>
          <Field
            label="Hora de la cita"
            required
            hint={hora ? formatHora(hora) : undefined}
            error={errores.hora}
          >
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              invalid={Boolean(errores.hora)}
            />
          </Field>
        </div>

        <Field label="Número de paciente" hint="Teléfono para confirmar la cita.">
          <Input
            type="tel"
            value={telefonoPaciente}
            onChange={(e) => setTelPaciente(e.target.value)}
            placeholder="0000 0000"
          />
        </Field>

        <Field label="Número familiar" hint="Teléfono alterno de un familiar.">
          <Input
            type="tel"
            value={telefonoFamiliar}
            onChange={(e) => setTelFamiliar(e.target.value)}
            placeholder="0000 0000"
          />
        </Field>

        <Field label="Categoría" required error={errores.categoria}>
          <Select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria | "")}
            invalid={Boolean(errores.categoria)}
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIAS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Link href="/" className={claseBoton("ghost")}>
            Cancelar
          </Link>
          <Button type="submit">
            <Plus width={18} height={18} />
            Guardar cita
          </Button>
        </div>
      </form>
    </Card>
  );
}

function FormReprogramar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citas = useCitas();
  const citaParam = searchParams.get("cita");

  const [seleccionada, setSeleccionada] = useState<string | null>(citaParam);
  const [nombrePaciente, setNombre] = useState("");
  const [expediente, setExpediente] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [error, setError] = useState("");

  const nombres = useMemo(() => nombresConocidos(citas), [citas]);

  const cita = seleccionada ? citas.find((c) => c.id === seleccionada) : undefined;

  /** Los tres campos de arriba filtran las citas existentes. */
  const coincidencias = useMemo(() => {
    const n = nombrePaciente.trim().toLowerCase();
    const exp = expediente.trim().toLowerCase();
    return citas
      .filter((c) => c.estado !== "cancelado")
      .filter((c) => (n ? c.nombrePaciente.toLowerCase().includes(n) : true))
      .filter((c) => (exp ? c.expediente.toLowerCase().includes(exp) : true))
      .filter((c) => (categoria ? c.categoria === categoria : true))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 6);
  }, [citas, nombrePaciente, expediente, categoria]);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!cita) {
      setError("Elige la cita que quieres mover.");
      return;
    }
    if (!nuevaFecha) {
      setError("Elige la nueva fecha.");
      return;
    }
    if (!nuevaHora) {
      setError("Elige la nueva hora.");
      return;
    }
    setError("");
    reprogramarCita(cita.id, nuevaFecha, nuevaHora);
    router.push(`/agenda/?fecha=${nuevaFecha}&cat=${cita.categoria}`);
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-1 text-lg font-semibold tracking-tight text-texto">Reprogramar</h2>
      <p className="mb-5 text-sm text-texto-suave">
        Busca la cita por nombre, expediente o categoría, elígela y asígnale una nueva
        fecha.
      </p>

      <form onSubmit={enviar} className="grid gap-4" noValidate>
        <Field label="Nombre paciente">
          <Input
            value={nombrePaciente}
            onChange={(e) => setNombre(e.target.value)}
            list="nombres-conocidos-repro"
            autoComplete="off"
            placeholder="Nombre y apellidos"
          />
          <datalist id="nombres-conocidos-repro">
            {nombres.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>

        <Field label="# Expediente">
          <Input
            value={expediente}
            onChange={(e) => setExpediente(e.target.value)}
            placeholder="Ej. 2026-0184"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nueva fecha"
            required
            hint={nuevaFecha ? formatFechaLarga(nuevaFecha) : undefined}
          >
            <Input
              type="date"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
            />
          </Field>
          <Field
            label="Nueva hora"
            required
            hint={nuevaHora ? formatHora(nuevaHora) : undefined}
          >
            <Input
              type="time"
              value={nuevaHora}
              onChange={(e) => setNuevaHora(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Categoría">
          <Select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria | "")}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <div>
          <span className="mb-2 block text-sm font-medium text-texto">
            Cita a reprogramar <span className="text-ufm-400">*</span>
          </span>
          {coincidencias.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle width={24} height={24} />}
              title="No hay citas que coincidan"
              description="Ajusta el nombre, el expediente o la categoría."
            />
          ) : (
            <ul className="grid gap-2">
              {coincidencias.map((c) => (
                <li key={c.id}>
                  <OpcionCita
                    cita={c}
                    activa={c.id === seleccionada}
                    onElegir={() => {
                      setSeleccionada(c.id);
                      setError("");
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
          {error && <p className="mt-2 text-xs font-medium text-ufm-300">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Link href="/" className={claseBoton("ghost")}>
            Cancelar
          </Link>
          <Button type="submit">
            <CalendarHeart width={18} height={18} />
            Mover cita
          </Button>
        </div>
      </form>
    </Card>
  );
}

/**
 * Punto 5 del pedido: el paciente que llega sin cita previa. Se registra sobre
 * la fecha de hoy y nace ya marcado como presente (lo hace `crearCita` a partir
 * del origen), porque llegar es justamente el motivo de anotarlo.
 */
function FormNuevoIngreso() {
  const router = useRouter();
  const citas = useCitas();
  const hoy = hoyISO();

  const [nombrePaciente, setNombre] = useState("");
  const [expediente, setExpediente] = useState("");
  const [hora, setHora] = useState(horaActual);
  const [telefonoPaciente, setTelPaciente] = useState("");
  const [telefonoFamiliar, setTelFamiliar] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  const nombres = useMemo(() => nombresConocidos(citas), [citas]);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const nuevos: Record<string, string> = {};
    if (!nombrePaciente.trim()) nuevos.nombrePaciente = "Escribe el nombre del paciente.";
    if (!hora) nuevos.hora = "Anota la hora en que llegó.";
    if (!categoria) nuevos.categoria = "Elige una categoría.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    crearCita({
      nombrePaciente: nombrePaciente.trim(),
      expediente: expediente.trim(),
      telefonoPaciente: telefonoPaciente.trim(),
      telefonoFamiliar: telefonoFamiliar.trim(),
      categoria: categoria as Categoria,
      fecha: hoy,
      hora,
      origen: "nuevo-ingreso",
    });
    router.push(`/agenda/?fecha=${hoy}`);
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-1 text-lg font-semibold tracking-tight text-texto">Nuevo ingreso</h2>
      <p className="mb-5 text-sm text-texto-suave">
        Paciente que llegó sin cita previa. Queda registrado el{" "}
        <span className="font-medium text-texto">{formatFechaLarga(hoy)}</span> y ya se cuenta
        como presente.
      </p>

      <form onSubmit={enviar} className="grid gap-4" noValidate>
        <Field label="Nombre paciente" required error={errores.nombrePaciente}>
          <Input
            value={nombrePaciente}
            onChange={(e) => setNombre(e.target.value)}
            list="nombres-conocidos-ingreso"
            autoComplete="off"
            placeholder="Nombre y apellidos"
            invalid={Boolean(errores.nombrePaciente)}
          />
          <datalist id="nombres-conocidos-ingreso">
            {nombres.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="# Expediente">
            <Input
              value={expediente}
              onChange={(e) => setExpediente(e.target.value)}
              placeholder="Ej. 2026-0184"
            />
          </Field>
          <Field
            label="Hora de llegada"
            required
            hint={hora ? formatHora(hora) : undefined}
            error={errores.hora}
          >
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              invalid={Boolean(errores.hora)}
            />
          </Field>
        </div>

        <Field label="Número de paciente" hint="Teléfono de contacto.">
          <Input
            type="tel"
            value={telefonoPaciente}
            onChange={(e) => setTelPaciente(e.target.value)}
            placeholder="0000 0000"
          />
        </Field>

        <Field label="Número familiar" hint="Teléfono alterno de un familiar.">
          <Input
            type="tel"
            value={telefonoFamiliar}
            onChange={(e) => setTelFamiliar(e.target.value)}
            placeholder="0000 0000"
          />
        </Field>

        <Field label="Categoría" required error={errores.categoria}>
          <Select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria | "")}
            invalid={Boolean(errores.categoria)}
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIAS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Link href="/" className={claseBoton("ghost")}>
            Cancelar
          </Link>
          <Button type="submit">
            <DoorOpen width={18} height={18} />
            Registrar ingreso
          </Button>
        </div>
      </form>
    </Card>
  );
}

function OpcionCita({
  cita,
  activa,
  onElegir,
}: {
  cita: Cita;
  activa: boolean;
  onElegir: () => void;
}) {
  const meta = metaCategoria(cita.categoria);
  const Icono = ICONO_CATEGORIA[cita.categoria];
  return (
    <button
      type="button"
      onClick={onElegir}
      aria-pressed={activa}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
        activa
          ? "border-ufm-600 bg-ufm-rojo/15"
          : "border-borde bg-superficie-alta hover:border-ufm-700",
      )}
    >
      <Icono width={18} height={18} className="shrink-0 text-texto-suave" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-texto">
          {cita.nombrePaciente || "Sin nombre"}
        </span>
        <span className="block text-xs text-texto-suave">
          {formatFechaCorta(cita.fecha)}
          {cita.hora && ` · ${formatHora(cita.hora)}`} · {meta.label}
          {cita.expediente.trim() && ` · Exp. ${cita.expediente}`}
        </span>
      </span>
      {activa && <Check width={16} height={16} className="shrink-0 text-ufm-300" />}
    </button>
  );
}
