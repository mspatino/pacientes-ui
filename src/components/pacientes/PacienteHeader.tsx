import {
  BsArrowLeft,
  BsPencilSquare,
  BsPersonCircle,
  BsTrashFill,
} from "react-icons/bs";

interface PacienteHeaderProps {
  pacienteNombreCompleto: string;
  pacienteId: number | null;
  sipacBlue: string;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function PacienteHeader({
  pacienteNombreCompleto,
  pacienteId,
  sipacBlue,
  onEdit,
  onDelete,
  onBack,
}: PacienteHeaderProps) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="d-flex align-items-center gap-3">
        <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
          <BsPersonCircle color={sipacBlue} />
          {pacienteNombreCompleto}
        </h1>
      </div>

      <div className="paciente-actions">
        <span
          role="button"
          tabIndex={0}
          title="Editar paciente"
          aria-label="Editar paciente"
          className="paciente-action-btn is-edit"
          onClick={() => {
            if (pacienteId) onEdit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (pacienteId) onEdit();
            }
          }}
        >
          <BsPencilSquare />
        </span>

        <span
          role="button"
          tabIndex={0}
          title="Eliminar paciente"
          aria-label="Eliminar paciente"
          className="paciente-action-btn is-delete"
          onClick={onDelete}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onDelete();
            }
          }}
        >
          <BsTrashFill />
        </span>

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
  );
}