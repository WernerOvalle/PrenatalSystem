"use client";

import { useState } from "react";
import { restablecerDatosDemo } from "@/lib/store";
import { Button } from "./ui";
import { AlertTriangle, RotateCcw } from "./icons";

/**
 * Franja fija de la demo: avisa que los datos son ficticios y permite volver a
 * los datos de ejemplo. Es un `div` y no un `header`, así que el CSS de
 * impresión la esconde por la clase `no-imprimir`.
 *
 * El restablecer pide confirmación en dos pasos, igual que eliminar una cita en
 * `CitaFila`, sin `window.confirm`.
 */
export function DemoBanner() {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <div className="no-imprimir border-b border-marca-oro/30 bg-marca-oro/10">
      <div className="mx-auto flex min-h-11 w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-1.5 text-sm sm:px-6">
        <p className="flex items-center gap-2 text-marca-oro">
          <AlertTriangle width={16} height={16} className="shrink-0" />
          <span>
            <span className="font-medium">Demo project — all data is fictional.</span>
            <span className="hidden text-texto-suave md:inline">
              {" "}
              Los cambios se guardan solo en este navegador.
            </span>
          </span>
        </p>

        {confirmando ? (
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-texto-suave">¿Volver a los datos de ejemplo?</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                restablecerDatosDemo();
                setConfirmando(false);
              }}
            >
              Sí, restablecer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
          </span>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            title="Borra tus cambios y recarga los datos de ejemplo"
            onClick={() => setConfirmando(true)}
          >
            <RotateCcw width={16} height={16} />
            Restablecer demo
          </Button>
        )}
      </div>
    </div>
  );
}
