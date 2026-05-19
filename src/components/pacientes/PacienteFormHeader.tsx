import { FaArrowLeft } from "react-icons/fa";

interface PacienteFormHeaderProps {
  isEditMode?: boolean;
  onBack: () => void;
}

export default function PacienteFormHeader({
  isEditMode = false,
  onBack,
}: PacienteFormHeaderProps) {
  return (
    <div className="d-flex align-items-center gap-2 mb-4">
      <button
        type="button"
        className="action-icon-btn"
        onClick={onBack}
      >
        <FaArrowLeft />
      </button>

      <div>
        <h3 className="hc-title mb-0">
          {isEditMode ? "Editar Paciente" : "Alta Paciente"}
        </h3>

        <div className="text-muted small">
          {isEditMode
            ? "Modificá los datos del paciente"
            : "Completá los datos del paciente"}
        </div>
      </div>
    </div>
  );
}