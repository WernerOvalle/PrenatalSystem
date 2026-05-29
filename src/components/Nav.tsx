"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui";
import { HeartPulse, Users, UserPlus } from "./icons";

const enlaces = [
  { href: "/", label: "Panel", icon: HeartPulse },
  { href: "/pacientes", label: "Gestantes", icon: Users },
  { href: "/pacientes/nueva", label: "Nueva", icon: UserPlus },
];

export function Nav() {
  const pathname = usePathname();

  function esActivo(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/pacientes") return pathname === "/pacientes" || pathname === "/pacientes/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-300/50">
            <HeartPulse width={20} height={20} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            Control Prenatal
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {enlaces.map(({ href, label, icon: Icon }) => {
            const activo = esActivo(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  activo
                    ? "bg-rose-50 text-rose-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon width={18} height={18} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
