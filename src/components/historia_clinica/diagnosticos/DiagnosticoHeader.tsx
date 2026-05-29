import {
  BsArrowLeft,
  BsPersonCircle,
} from "react-icons/bs";

import { GiBrain } from "react-icons/gi";

interface DiagnosticoHeaderProps {
  pacienteNombre: string;
  onBack: () => void;
}

export default function DiagnosticoHeader({
  pacienteNombre,
  onBack,
}: DiagnosticoHeaderProps) {
  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">

        {/* LEFT */}
        <div className="d-flex align-items-center gap-3">

          <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
            <GiBrain />
            Diagnósticos
          </h1>

        </div>

        {/* RIGHT */}
        <div className="historia-clinica-actions">

          <span
            role="button"
            tabIndex={0}
            title="Volver"
            aria-label="Volver"
            className="paciente-action-btn"
            onClick={onBack}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onBack();
              }
            }}
          >
            <BsArrowLeft />
          </span>

        </div>

      </div>

      <div className="small text-muted d-flex align-items-center gap-2 mb-3">

        <BsPersonCircle />

        <span>
          Paciente:{" "}
          <span className="fw-semibold text-body">
            {pacienteNombre}
          </span>
        </span>

      </div>
    </>
  );
}

