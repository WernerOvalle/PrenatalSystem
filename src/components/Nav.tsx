"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui";
import { Bell, Home, Users } from "./icons";
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
];

export function Nav() {
  const pathname = usePathname();
  const citas = useCitas();
  const hoy = hoyISO();
  const pendientes = pendientesDeHoy(citas, hoy);

  function esActivo(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-borde bg-fondo/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-borde">
            <Image
              src="/escudo-ufm.png"
              alt="Escudo de la Universidad Francisco Marroquín"
              width={26}
              height={33}
              priority
            />
          </span>
          <span className="hidden leading-tight lg:block">
            <span className="block text-[15px] font-semibold tracking-tight text-texto">
              Sistema de Citas
            </span>
            <span className="block whitespace-nowrap text-xs text-texto-suave">
              Centro de salud Bárbara
            </span>
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {ENLACES.map(({ href, label, icono: Icono }) => {
            const activo = esActivo(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  activo
                    ? "bg-ufm-rojo/20 text-ufm-300 after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-ufm-oro"
                    : "text-texto-suave hover:bg-superficie-alta hover:text-texto",
                )}
              >
                <Icono width={18} height={18} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href={`/agenda/?fecha=${hoy}`}
          aria-label={
            pendientes > 0
              ? `${pendientes} citas de hoy sin confirmar`
              : "Agenda de hoy, sin citas pendientes"
          }
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-texto-suave transition-colors hover:bg-superficie-alta hover:text-texto"
        >
          <Bell width={20} height={20} />
          {pendientes > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ufm-600 px-1 text-[10px] font-semibold text-white ring-2 ring-fondo">
              {pendientes}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
