"use client";

import type { Cita } from "@/types";
import { citasPorCategoria, metaAsistencia, metaEstado } from "@/lib/citas";
import { formatHora } from "@/lib/fecha";
import { BloqueHoja, Hoja } from "./Hoja";

/**
 * Casilla para marcar a mano en el papel: si nadie registró la asistencia en la
 * app, la hoja sale con los dos cuadros vacíos y la clínica los llena a lápiz.
 */
function CeldaAsistencia({ cita }: { cita: Cita }) {
  if (cita.asistencia === "sin-registro") {
    return <span className="whitespace-nowrap">☐ Llegó&nbsp;&nbsp;☐ No llegó</span>;
  }
  return <span className="font-medium">{metaAsistencia(cita.asistencia).label}</span>;
}

function TablaCitas({ citas }: { citas: Cita[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th className="w-20 text-left">Hora</th>
          <th className="text-left">Paciente</th>
          <th className="w-28 text-left">Expediente</th>
          <th className="w-36 text-left">Teléfonos</th>
          <th className="w-28 text-left">Confirmación</th>
          <th className="w-36 text-left">Asistencia</th>
        </tr>
      </thead>
      <tbody>
        {citas.map((c) => (
          <tr key={c.id} className="evitar-corte">
            <td className="tabular-nums">{formatHora(c.hora)}</td>
            <td>
              {c.nombrePaciente || "Sin nombre"}
              {c.origen === "nuevo-ingreso" && (
                <span className="text-texto-suave"> · sin cita previa</span>
              )}
            </td>
            <td>{c.expediente.trim() || "—"}</td>
            <td>
              {[c.telefonoPaciente, c.telefonoFamiliar].filter((t) => t.trim()).join(" / ") ||
                "—"}
            </td>
            <td>{metaEstado(c.estado).label}</td>
            <td>
              <CeldaAsistencia cita={c} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Documento 1: la lista de pacientes del día dividida por categoría, una
 * categoría por página. Las categorías sin citas se omiten.
 */
export function HojaLista({ citas, fecha }: { citas: Cita[]; fecha: string }) {
  const grupos = citasPorCategoria(citas, fecha);
  const total = grupos.reduce((suma, g) => suma + g.citas.length, 0);

  return (
    <Hoja
      titulo="Lista de pacientes por categoría"
      fecha={fecha}
      resumen={`${total} ${total === 1 ? "paciente" : "pacientes"}`}
    >
      {grupos.length === 0 ? (
        <p className="text-sm text-texto-suave">No hay citas agendadas para este día.</p>
      ) : (
        grupos.map((g, i) => (
          <BloqueHoja
            key={g.meta.slug}
            titulo={g.meta.label}
            conteo={g.citas.length}
            saltoDePagina={i < grupos.length - 1}
          >
            <TablaCitas citas={g.citas} />
          </BloqueHoja>
        ))
      )}
    </Hoja>
  );
}
