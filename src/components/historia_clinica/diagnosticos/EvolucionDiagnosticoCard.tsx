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
    <div className="hc-evo-card">
      <div className="hc-evo-line" />

      <div className="hc-evo-content">
        <div className="hc-evo-date">
          {formatFechaHora(evolucion.fecha)}
        </div>

        <div className="hc-evo-note">
          {nota}
        </div>
      </div>
    </div>
  );
}
