import { BsClipboard2Pulse, BsJournalText, BsPlusLg } from "react-icons/bs";
import { CButton } from "@coreui/react";

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
    <div className="border rounded p-3 bg-light-subtle">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div className="d-flex flex-column gap-1">
          <div className="d-inline-flex align-items-center gap-2 fw-semibold">
            <BsClipboard2Pulse />
            Historia clínica
          </div>

          <div className="small text-muted">
            {hasHistoriaClinica
              ? "La historia clínica ya está disponible para este paciente."
              : "Este paciente todavía no tiene historia clínica cargada."}
          </div>
        </div>

        <CButton
          color="primary"
          size="sm"
          className="d-inline-flex align-items-center gap-2"
          title={hasHistoriaClinica ? "Abrir historia clínica" : "Crear historia clínica"}
          aria-label={hasHistoriaClinica ? "Abrir historia clínica" : "Crear historia clínica"}
          onClick={onOpenHistoriaClinica}
          disabled={!pacienteId}
        >
          {hasHistoriaClinica ? <BsJournalText /> : <BsPlusLg />}
          {hasHistoriaClinica ? "Abrir" : "Crear"}
        </CButton>
      </div>
    </div>
  );
}