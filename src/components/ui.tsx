import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
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
        "rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm shadow-slate-200/50 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-300/50 hover:from-rose-500 hover:to-pink-700 focus-visible:ring-rose-400",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300",
    ghost:
      "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300",
    danger:
      "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 focus-visible:ring-rose-300",
  };
  const sizes: Record<string, string> = {
    sm: "h-9 px-3 text-sm gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: "slate" | "rose" | "emerald" | "amber" | "sky" | "violet";
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    rose: "bg-rose-100 text-rose-700 ring-rose-200",
    emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-100 text-amber-800 ring-amber-200",
    sky: "bg-sky-100 text-sky-700 ring-sky-200",
    violet: "bg-violet-100 text-violet-700 ring-violet-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
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
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}

const controlBase =
  "w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300";

const borderIdle = "border-slate-200";
const borderError = "border-rose-300";

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
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(controlBase, "min-h-[88px] resize-y py-2.5", borderIdle, className)}
      {...props}
    />
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 has-[:checked]:border-rose-300 has-[:checked]:bg-rose-50/70",
        className,
      )}
    >
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
        {...props}
      />
      {label}
    </label>
  );
}

export function Stat({
  icon,
  value,
  label,
  tone = "rose",
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  tone?: "rose" | "sky" | "emerald" | "amber" | "violet";
}) {
  const tones: Record<string, string> = {
    rose: "bg-rose-100 text-rose-600",
    sky: "bg-sky-100 text-sky-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    violet: "bg-violet-100 text-violet-600",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", tones[tone])}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-300/50">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function RiskBadge({ nivel }: { nivel: "bajo" | "alto" }) {
  return nivel === "alto" ? (
    <Badge tone="rose">Alto riesgo</Badge>
  ) : (
    <Badge tone="emerald">Bajo riesgo</Badge>
  );
}
