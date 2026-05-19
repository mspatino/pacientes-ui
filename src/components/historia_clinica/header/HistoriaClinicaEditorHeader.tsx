//import { CButton } from "@coreui/react";
import { BsArrowLeft, BsClipboard2Pulse } from "react-icons/bs";

interface HistoriaClinicaEditorHeaderProps {
  exists: boolean;
  pacienteNombre: string;
  pageTitle: string;

  onBack: () => void;
}

export default function HistoriaClinicaEditorHeader({
  pacienteNombre,
  pageTitle,
  onBack,
}: HistoriaClinicaEditorHeaderProps) {
  return (
    <>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div className="d-flex flex-column gap-1">
          <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
            <BsClipboard2Pulse />
            {pageTitle}
          </h1>
          <div className="small text-muted">
            Paciente: <span className="fw-semibold text-body">{pacienteNombre}</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span
            role="button"
            tabIndex={0}
            title="Volver"
            aria-label="Volver"
            className="paciente-action-btn"
            onClick={onBack}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onBack();
              }
            }}
          >
            <BsArrowLeft />
          </span>
        </div>
      </div>
    </>
  );
}
