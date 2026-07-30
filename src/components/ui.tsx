import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-borde bg-superficie shadow-sm shadow-black/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type VarianteBoton = "primary" | "secondary" | "ghost" | "danger";
export type TamanoBoton = "sm" | "md" | "grande";

const BOTON_BASE =
  "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-fondo disabled:cursor-not-allowed disabled:opacity-50";

const BOTON_VARIANTES: Record<VarianteBoton, string> = {
  primary:
    "bg-ufm-600 text-white shadow-sm shadow-black/40 hover:bg-ufm-700 focus-visible:ring-ufm-400",
  secondary:
    "border border-borde bg-superficie-alta text-texto hover:border-ufm-700 hover:bg-borde/60 focus-visible:ring-ufm-400",
  ghost: "text-texto-suave hover:bg-superficie-alta hover:text-texto focus-visible:ring-borde",
  danger:
    "border border-ufm-700 bg-ufm-700/20 text-ufm-300 hover:bg-ufm-700/35 focus-visible:ring-ufm-400",
};

const BOTON_TAMANOS: Record<TamanoBoton, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  /** Los dos botones grandes del prototipo (276×72 px). */
  grande: "h-[72px] w-full px-6 text-base gap-3",
};

/**
 * Clases del botón sin el elemento `<button>`, para dárselas a un `<Link>`.
 * Un `<button>` dentro de un `<a>` es HTML inválido.
 */
export function claseBoton(
  variant: VarianteBoton = "primary",
  size: TamanoBoton = "md",
  className?: string,
): string {
  return cn(BOTON_BASE, BOTON_VARIANTES[variant], BOTON_TAMANOS[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: VarianteBoton;
  size?: TamanoBoton;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={claseBoton(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export type Tono = "gris" | "rojo" | "oro" | "azul" | "verde" | "cancelado";

const TONOS: Record<Tono, string> = {
  gris: "bg-superficie-alta text-texto-suave ring-borde",
  rojo: "bg-ufm-rojo/20 text-ufm-300 ring-ufm-rojo/50",
  oro: "bg-ufm-oro/15 text-ufm-oro ring-ufm-oro/40",
  azul: "bg-ufm-azul/25 text-ufm-azul-claro ring-ufm-azul/60",
  verde: "bg-ufm-verde/20 text-ufm-verde-claro ring-ufm-verde/50",
  cancelado: "bg-superficie-alta text-texto-suave ring-ufm-700/70 line-through",
};

export function Badge({
  children,
  tono = "gris",
  className,
}: {
  children: ReactNode;
  tono?: Tono;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-texto">
        {label}
        {required && <span className="text-ufm-400">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-ufm-300">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-texto-suave">{hint}</span>
      ) : null}
    </label>
  );
}

const controlBase =
  "w-full rounded-xl border bg-superficie-alta px-3.5 text-sm text-texto shadow-sm shadow-black/20 transition-colors placeholder:text-texto-suave/70 focus:outline-none focus:ring-2 focus:ring-ufm-400 focus:border-ufm-400";

const borderIdle = "border-borde";
const borderError = "border-ufm-600";

export function Input({
  className,
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(controlBase, "h-11", invalid ? borderError : borderIdle, className)}
      {...props}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cn(
        controlBase,
        "h-11 appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-9",
        invalid ? borderError : borderIdle,
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239aa7b4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Stat({
  icon,
  value,
  label,
  tono = "rojo",
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  tono?: "rojo" | "oro" | "azul" | "gris";
}) {
  const tonos: Record<string, string> = {
    rojo: "bg-ufm-rojo/20 text-ufm-300",
    oro: "bg-ufm-oro/15 text-ufm-oro",
    azul: "bg-ufm-azul/25 text-ufm-azul-claro",
    gris: "bg-superficie-alta text-texto-suave",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            tonos[tono],
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold tracking-tight text-texto">{value}</div>
          <div className="truncate text-sm text-texto-suave">{label}</div>
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-borde bg-superficie/50 px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-superficie-alta text-texto-suave">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-texto">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-texto-suave">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ufm-600 text-white shadow-sm shadow-black/40">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-texto">{title}</h1>
          {subtitle && <p className="text-sm text-texto-suave">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
