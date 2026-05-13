import {
  BsArrowLeft,
  BsClipboard2Pulse,
  BsFilePdf,
  BsPencilSquare,
  BsPersonCircle,
  BsTrashFill,
} from "react-icons/bs";

interface HistoriaClinicaHeaderProps {
  
  pacienteNombre: string;
  onDownloadPdf: () => void;
  onDelete: () => void;
  onBack: () => void;
  onEdit: () => void;
}

export default function HistoriaClinicaHeader({
  
  pacienteNombre,
  onDownloadPdf,
  onDelete,
  onBack,
  onEdit,
}: HistoriaClinicaHeaderProps) {
  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
            <BsClipboard2Pulse />
            Historia clínica
          </h1>
        </div>

        <div className="historia-clinica-actions">

          <span
            role="button"
            tabIndex={0}
            title="Descargar PDF"
            aria-label="Descargar PDF"
            className="paciente-action-btn"
            onClick={onDownloadPdf}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDownloadPdf();
              }
            }}
          >
            <BsFilePdf />
          </span>

          <span
            role="button"
            tabIndex={0}
            title="Editar historia clínica"
            aria-label="Editar historia clínica"
            className="paciente-action-btn is-edit"
            onClick={onEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEdit();
              }
            }}
          >
            <BsPencilSquare />
          </span>

          <span
            role="button"
            tabIndex={0}
            title="Eliminar historia clínica"
            aria-label="Eliminar historia clínica"
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