"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "./ui";
import { Bell, FileText, Home, LogoDemo, Menu, Users, X } from "./icons";
import { ICONO_CATEGORIA } from "./iconos-dominio";
import { CATEGORIAS, pendientesDeHoy } from "@/lib/citas";
import { hoyISO } from "@/lib/fecha";
import { useCitas } from "@/lib/store";

const ENLACES = [
  { href: "/", label: "Inicio", icono: Home },
  { href: "/totales/", label: "Todos pacientes", icono: Users },
  ...CATEGORIAS.map((c) => ({
    href: `/calendario/${c.slug}/`,
    label: c.label,
    icono: ICONO_CATEGORIA[c.slug],
  })),
  { href: "/reportes/", label: "Reportes", icono: FileText },
];

export function Nav() {
  const pathname = usePathname();
  const citas = useCitas();
  const hoy = hoyISO();
  const pendientes = pendientesDeHoy(citas, hoy);

  /**
   * Un solo menú "sándwich" en todos los tamaños: con siete secciones los
   * enlaces en línea ya no caben en el ancho del contenido y aparecían barras
   * de scroll dentro del encabezado.
   */
  const [abierto, setAbierto] = useState(false);
  const menuId = useId();
  const contenedor = useRef<HTMLDivElement>(null);

  /**
   * Al cambiar de pantalla el menú sobra. Se ajusta durante el render y no en
   * un efecto —incluido el botón «atrás» del navegador— para no encadenar un
   * render extra con el menú todavía abierto.
   */
  const [rutaDelMenu, setRutaDelMenu] = useState(pathname);
  if (rutaDelMenu !== pathname) {
    setRutaDelMenu(pathname);
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;

    function alPulsarFuera(e: MouseEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    }
    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }

    document.addEventListener("mousedown", alPulsarFuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alPulsarFuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  function esActivo(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const activo = ENLACES.find((e) => esActivo(e.href));

  return (
    <header className="sticky top-0 z-30 border-b border-borde bg-fondo/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2.5">
          <LogoDemo width={40} height={40} className="shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-semibold tracking-tight text-texto">
              MediAgenda
            </span>
            <span className="block truncate text-xs text-texto-suave">
              Sistema de citas · Demo
            </span>
          </span>
        </Link>

        {/* La sección actual, para no perder el contexto al cerrar el menú. */}
        {activo && activo.href !== "/" && (
          <span className="ml-2 hidden items-center gap-1.5 rounded-xl bg-marca-rojo/20 px-3 py-1.5 text-sm font-medium text-marca-300 sm:flex">
            <activo.icono width={16} height={16} />
            {activo.label}
          </span>
        )}

        <Link
          href={`/agenda/?fecha=${hoy}`}
          aria-label={
            pendientes > 0
              ? `${pendientes} citas de hoy sin confirmar`
              : "Agenda de hoy, sin citas pendientes"
          }
          className="relative ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-texto-suave transition-colors hover:bg-superficie-alta hover:text-texto"
        >
          <Bell width={20} height={20} />
          {pendientes > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-marca-600 px-1 text-[10px] font-semibold text-white ring-2 ring-fondo">
              {pendientes}
            </span>
          )}
        </Link>

        <div className="relative shrink-0" ref={contenedor}>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls={menuId}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
              abierto
                ? "border-marca-600 bg-marca-rojo/20 text-marca-300"
                : "border-borde bg-superficie-alta text-texto-suave hover:text-texto",
            )}
          >
            {abierto ? <X width={20} height={20} /> : <Menu width={20} height={20} />}
          </button>

          {abierto && (
            <nav
              id={menuId}
              aria-label="Secciones"
              className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-borde bg-superficie p-1.5 shadow-lg shadow-black/50"
            >
              {ENLACES.map(({ href, label, icono: Icono }) => {
                const esta = esActivo(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={esta ? "page" : undefined}
                    onClick={() => setAbierto(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      esta
                        ? "bg-marca-rojo/20 text-marca-300"
                        : "text-texto-suave hover:bg-superficie-alta hover:text-texto",
                    )}
                  >
                    <Icono width={18} height={18} className="shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
