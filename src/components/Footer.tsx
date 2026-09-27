import { Linkedin } from "./icons";

export function Footer() {
  return (
    <footer className="border-t border-borde bg-fondo/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 py-6 text-xs text-texto-suave sm:flex-row sm:justify-between sm:px-6">
        <span>MediAgenda Demo · Sistema de citas</span>
        <span className="flex items-center gap-1.5">
          Desarrollado por
          <a
            href="https://www.linkedin.com/in/werner-ovalle/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-texto transition-colors hover:text-marca-300"
          >
            <Linkedin width={14} height={14} />
            Werner Ovalle
          </a>
        </span>
      </div>
    </footer>
  );
}
