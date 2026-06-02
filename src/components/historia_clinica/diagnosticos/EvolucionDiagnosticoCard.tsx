import type { EvolucionDiagnosticoDTO } from "../../../api/pacientes";

import { formatFechaHora } from "./diagnosticoUtils";

interface Props {
  evolucion: EvolucionDiagnosticoDTO;
}

export default function EvolucionDiagnosticoCard({
  evolucion,
}: Props) {
  const nota =
    evolucion.nota ??
    evolucion.evolucion ??
    evolucion.descripcion ??
    "";

  return (
    <div className="sipac-seguimiento-item">
      <span className="sipac-seguimiento-fecha">
        {formatFechaHora(evolucion.fecha)}
      </span>

      <span className="sipac-seguimiento-nota">
        {nota}
      </span>
    </div>
  );
}
