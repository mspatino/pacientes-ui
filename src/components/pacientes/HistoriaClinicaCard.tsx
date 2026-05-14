interface HistoriaClinicaCardProps {
  hasHistoriaClinica: boolean;
  pacienteId: number | null;
  onOpenHistoriaClinica: () => void;
}

export default function HistoriaClinicaCard({
  hasHistoriaClinica,
  pacienteId,
  onOpenHistoriaClinica,
}: HistoriaClinicaCardProps) {
  return (
    <div className="col-12 col-md-6">
    <div className="border rounded p-3 bg-light-subtle shadow-sm">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          {/* <div className="fw-semibold">
        Historia clínica
      </div> */}

          <span
            className={`small ${
              hasHistoriaClinica 
              ? "text-success" 
              : "text-muted"
            }`}
          >
            {hasHistoriaClinica
              ? "Historia clínica disponible."
              : "Sin historia clínica registrada."}
          </span>
        </div>

        <button
          type="button"
          className={`sipac-action-btn ${
          !hasHistoriaClinica ? "success" : ""
        }`}
          
          onClick={onOpenHistoriaClinica}
          disabled={!pacienteId}
        >
          {hasHistoriaClinica ? "Abrir" : "Crear"}
        </button>
      </div>
    </div>
    </div>
  );
}