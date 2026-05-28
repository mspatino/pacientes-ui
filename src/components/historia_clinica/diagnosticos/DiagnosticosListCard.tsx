import { BsPlusLg } from "react-icons/bs";
import { GiBrain } from "react-icons/gi";
import type { DiagnosticoDTO } from "../../../api/pacientes";
import SectionCard from "../shared/SectionCard";
import {
  formatFechaHora,
  getDiagnosticoSummary,
  getDiagnosticoTipoBadgeStyle,
  getDiagnosticoTipoLabel,
} from "./diagnosticoUtils";

interface DiagnosticosListCardProps {
  diagnosticos: DiagnosticoDTO[];
  onOpen: (index: number) => void;
  onAdd: () => void;
  readOnly?: boolean;
}

export default function DiagnosticosListCard({
  diagnosticos,
  onOpen,
  onAdd,
  readOnly = false,
}: DiagnosticosListCardProps) {
  const headerAction = readOnly ? null : (
    <button
      type="button"
      className="sipac-toolbar-btn d-inline-flex align-items-center gap-2"
      onClick={onAdd}
    >
      <BsPlusLg size={14}/>
      Agregar
    </button>
  );



  return (
    <SectionCard
      title={
        <span className="d-inline-flex align-items-center gap-2">
          <GiBrain />
          Diagnósticos
        </span>
      }
      headerAction={headerAction}
    >
      {diagnosticos.length === 0 ? (
        <div className="small text-muted">
          Todavía no hay diagnósticos cargados para esta historia clínica.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2 mb-3">
          {diagnosticos.map((diagnostico, index) => {

              const ultimaEvolucion =
  diagnostico.evoluciones?.[
    diagnostico.evoluciones.length - 1
  ];

            return (
              <div
                key={index}
                className="sipac-diagnostico-item"
                role="button"
                tabIndex={0}
                onClick={() => onOpen(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(index);
                  }
                }}
              >
                <div className="d-flex flex-column gap-1">

                  {/* HEADER */}
                  {/* <div className="d-flex align-items-center gap-2 flex-wrap small text-muted">

                    <span
                      className="badge rounded-pill"
                      style={getDiagnosticoTipoBadgeStyle(diagnostico.tipo)}
                    >
                      {getDiagnosticoTipoLabel(diagnostico.tipo)}
                    </span>

                    {diagnostico.fechaInicio ? (
                      <span>
                        <span
                          className="badge rounded-pill me-1"
                          style={{
                            backgroundColor: "#F6F8F6",
                            color: "#6C8A6D",
                            border: "1px solid #DCE6DC",
                          }}
                        >
                          Inicio
                        </span>

                        {formatFechaHora(diagnostico.fechaInicio)}
                      </span>
                    ) : null}

                    {diagnostico.fechaFin ? (
                      <span>
                        <span
                          className="badge rounded-pill me-1"
                          style={{
                            backgroundColor: "#FAF8F5",
                            color: "#9A7B5F",
                            border: "1px solid #E8DDD2",
                          }}
                        >
                          Alta
                        </span>

                        {formatFechaHora(diagnostico.fechaFin)}
                      </span>
                    ) : null}
                  </div> */}
                  <div className="d-flex justify-content-between align-items-start gap-2">

  {/* TIPO */}
  <span
    className="badge rounded-pill"
    style={getDiagnosticoTipoBadgeStyle(diagnostico.tipo)}
  >
    {getDiagnosticoTipoLabel(diagnostico.tipo)}
  </span>

  {/* FECHAS */}
  <div className="d-flex align-items-center gap-2 flex-wrap small text-body-secondary ms-auto">

    {diagnostico.fechaInicio ? (
      <span>
        <span
          className="badge rounded-pill me-1"
          style={{
            backgroundColor: "#F6F8F6",
            color: "#6C8A6D",
            border: "1px solid #DCE6DC",
          }}
        >
          Inicio
        </span>

        {formatFechaHora(diagnostico.fechaInicio)}
      </span>
    ) : null}

    {diagnostico.fechaFin ? (
      <span>
        <span
          className="badge rounded-pill me-1"
          style={{
            backgroundColor: "#FAF8F5",
            color: "#9A7B5F",
            border: "1px solid #E8DDD2",
          }}
        >
          Alta
        </span>

        {formatFechaHora(diagnostico.fechaFin)}
      </span>
    ) : null}
  </div>
</div>

                  {/* DESCRIPCION */}
                  <div className="fw-semibold fs-6">
                    {getDiagnosticoSummary(diagnostico)}
                  </div>

                  {/* TRATAMIENTO */}
                  {diagnostico.tratamiento?.trim() ? (
                    <div className="small text-body-secondary">
                      Tratamiento: {diagnostico.tratamiento.trim()}
                    </div>
                  ) : null}

                  {/* EVOLUCION */}
                  {/* {diagnostico.evolucion?.trim() ? (
                    <div className="small fst-italic text-muted">
                      {diagnostico.evolucion.trim()}
                    </div>
                  ) : null} */}
                  {/* ULTIMA EVOLUCION */}
{ultimaEvolucion?.nota?.trim() ? (
  <div className="small fst-italic text-muted">
    {ultimaEvolucion.nota.trim()}
  </div>
) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
