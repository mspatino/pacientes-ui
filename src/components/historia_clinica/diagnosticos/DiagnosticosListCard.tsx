import { CButton } from "@coreui/react";
import { BsPlusLg, BsTrashFill } from "react-icons/bs";
import { GiBrain } from "react-icons/gi";
import type { DiagnosticoDTO } from "../../../api/pacientes";
import SectionCard from "../shared/SectionCard";
import {
  getDiagnosticoSummary,
  isDiagnosticoPrincipal,
  sipacBlue,
} from "./diagnosticoUtils";

interface DiagnosticosListCardProps {
  diagnosticos: DiagnosticoDTO[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onView: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function DiagnosticosListCard({
  diagnosticos,
  selectedIndex,
  onSelect,
  onAdd,
  onView,
  onRemove,
}: DiagnosticosListCardProps) {
  const headerAction = (
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
          <div className="d-flex flex-column gap-3">
            <div className="d-flex flex-column gap-2 mb-3">
              {diagnosticos.map((diagnostico, index) => (
                <div
                  key={index}
                  className={`d-flex justify-content-between align-items-center gap-2 border rounded p-2 ${
                    selectedIndex === index ? "border-primary bg-light" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelect(index)}
                >
                  <div className="text-truncate">
                    {isDiagnosticoPrincipal(diagnostico) ? (
                      <span
                        className="badge rounded-pill me-2"
                        style={{
                          backgroundColor: "#E8F1FB",
                          color: sipacBlue,
                          border: `1px solid ${sipacBlue}33`,
                        }}
                      >
                        Principal
                      </span>
                    ) : null}
                    <span className="fw-semibold me-2">
                      {getDiagnosticoSummary(diagnostico)}
                    </span>
                  </div>

                  <div className="d-flex gap-2 flex-shrink-0">
                    <CButton
                      type="button"
                      size="sm"
                      color="secondary"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(index);
                      }}
                    >
                      Ver
                    </CButton>
                    <CButton
                      type="button"
                      size="sm"
                      color="danger"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                      }}
                    >
                      <BsTrashFill />
                    </CButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </SectionCard>
  );
}
