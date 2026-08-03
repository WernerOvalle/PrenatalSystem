"use client";

import type { Cita } from "@/types";
import { metaCategoria, resumenDelDia } from "@/lib/citas";
import { formatHora } from "@/lib/fecha";
import { BloqueHoja, Hoja } from "./Hoja";

function ListaPacientes({ citas }: { citas: Cita[] }) {
  if (citas.length === 0) {
    return <p className="text-sm text-texto-suave">—</p>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th className="w-20 text-left">Hora</th>
          <th className="text-left">Paciente</th>
          <th className="w-28 text-left">Expediente</th>
          <th className="w-40 text-left">Categoría</th>
        </tr>
      </thead>
      <tbody>
        {citas.map((c) => (
          <tr key={c.id} className="evitar-corte">
            <td className="tabular-nums">{formatHora(c.hora)}</td>
            <td>{c.nombrePaciente || "Sin nombre"}</td>
            <td>{c.expediente.trim() || "—"}</td>
            <td>{metaCategoria(c.categoria).label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Cifra({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="cifra rounded-xl border border-borde px-3 py-2">
      <div className="text-xl font-semibold tabular-nums text-texto">{valor}</div>
      <div className="text-xs text-texto-suave">{label}</div>
    </div>
  );
}

/**
 * Documento 2: el cierre del día. Cada paciente aparece en exactamente un
 * bloque, y los bloques vacíos también se imprimen para que el papel deje
 * constancia de que se revisaron.
 */
export function HojaResumen({ citas, fecha }: { citas: Cita[]; fecha: string }) {
  const r = resumenDelDia(citas, fecha);

  const llegaron =
    r.confirmadosLlegaron.length + r.noConfirmadosLlegaron.length + r.nuevoIngreso.length;
  const noLlegaron = r.confirmadosNoLlegaron.length + r.noConfirmadosNoLlegaron.length;
  /** Todo lo que tenía cita: los buckets del día menos el de nuevo ingreso. */
  const agendadas =
    r.confirmadosLlegaron.length +
    r.noConfirmadosLlegaron.length +
    noLlegaron +
    r.sinRegistrar.length +
    r.cancelados.length;

  const bloques = [
    { titulo: "Confirmados que sí llegaron", citas: r.confirmadosLlegaron },
    { titulo: "No confirmados que sí llegaron", citas: r.noConfirmadosLlegaron },
    { titulo: "Confirmados que no llegaron", citas: r.confirmadosNoLlegaron },
    { titulo: "No confirmados que no llegaron", citas: r.noConfirmadosNoLlegaron },
    { titulo: "Nuevo ingreso (llegaron sin cita previa)", citas: r.nuevoIngreso },
    { titulo: "Sin registrar (no se marcó su asistencia)", citas: r.sinRegistrar },
    { titulo: "Citas canceladas", citas: r.cancelados },
  ];

  return (
    <Hoja
      titulo="Resumen del día"
      fecha={fecha}
      resumen={`${agendadas} agendadas · ${r.nuevoIngreso.length} de nuevo ingreso`}
    >
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Cifra valor={agendadas} label="Citas agendadas" />
        <Cifra valor={llegaron} label="Pacientes atendidos" />
        <Cifra valor={noLlegaron} label="No llegaron" />
        <Cifra valor={r.nuevoIngreso.length} label="Nuevo ingreso" />
      </div>

      {bloques.map((b) => (
        <BloqueHoja key={b.titulo} titulo={b.titulo} conteo={b.citas.length}>
          <ListaPacientes citas={b.citas} />
        </BloqueHoja>
      ))}
    </Hoja>
  );
}
