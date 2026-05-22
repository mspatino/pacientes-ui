import { CButton } from "@coreui/react";
import { BsPlusLg, BsTrashFill } from "react-icons/bs";
import { GiBrain } from "react-icons/gi";
import type { DiagnosticoDTO } from "../../../api/pacientes";
import SectionCard from "../shared/SectionCard";
import {
  getCie10Label,
  getDiagnosticoSummary,
  isDiagnosticoPrincipal,
  sipacBlue,
} from "./diagnosticoUtils";

interface DiagnosticosListCardProps {
  diagnosticos: DiagnosticoDTO[];
  onOpen: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}

export default function DiagnosticosListCard({
  diagnosticos,
  onOpen,
  onAdd,
  onRemove,
  readOnly = false,
}: DiagnosticosListCardProps) {
  const headerAction = readOnly ? null : (
    <CButton
      type="button"
      color="primary"
      size="sm"
      className="d-inline-flex align-items-center gap-2"
      onClick={onAdd}
    >
      <BsPlusLg />
      Agregar
    </CButton>
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
              const cie10Label = getCie10Label(diagnostico.cie10);
              const isPrincipal = isDiagnosticoPrincipal(diagnostico);
              const estado = diagnostico.fechaFin ? "Finalizado" : "Activo";

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
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div className="min-w-0">
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        {isPrincipal ? (
                          <span
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: "#E8F1FB",
                              color: sipacBlue,
                              border: `1px solid ${sipacBlue}33`,
                            }}
                          >
                            Principal
                          </span>
                        ) : null}

                        <span className="sipac-diagnostico-status">{estado}</span>
                      </div>

                      <div className="fw-semibold text-truncate">
                        {getDiagnosticoSummary(diagnostico)}
                      </div>

                      <div className="small text-muted text-truncate">
                        {cie10Label || "Sin CIE-10 asociado"}
                        {diagnostico.fechaFin ? ` · Hasta ${diagnostico.fechaFin}` : ""}
                      </div>

                      {diagnostico.evolucion?.trim() ? (
                        <div className="small text-muted sipac-diagnostico-preview">
                          {diagnostico.evolucion.trim()}
                        </div>
                      ) : null}
                    </div>

                    {!readOnly ? (
                      <CButton
                        type="button"
                        size="sm"
                        color="danger"
                        variant="outline"
                        className="flex-shrink-0"
                        aria-label="Eliminar diagnóstico"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(index);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <BsTrashFill />
                      </CButton>
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
