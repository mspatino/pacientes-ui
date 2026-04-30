import { CButton } from "@coreui/react";

interface DiagnosticoField {
  label: string;
  value: string;
}

interface HistoriaClinicaDiagnosticoCardProps {
  diagnosticoPrincipal: Record<string, unknown> | null;
  diagnosticoFields: DiagnosticoField[];
  
  onViewDiagnosticos: () => void;
}

export default function HistoriaClinicaDiagnosticoCard({
  diagnosticoPrincipal,
  diagnosticoFields,
  
  onViewDiagnosticos,
}: HistoriaClinicaDiagnosticoCardProps) {
  if (!diagnosticoPrincipal) {
    return (
      <div className="border rounded p-3 bg-light-subtle">
        <div className="fw-semibold text-body mb-1">
          Sin diagnóstico principal
        </div>

        <div className="small text-muted">
          El diagnóstico principal se gestiona desde la edición de la historia
          clínica.
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        <div className="small text-muted">
          Resumen del diagnóstico principal asociado a esta historia clínica.
        </div>

        <div className="small text-muted">
          Tipo:{" "}
          <span className="fw-semibold text-success">
            Principal
          </span>
        </div>
      </div>

      <div className="row g-3">
        {diagnosticoFields.length > 0 ? (
          diagnosticoFields.map((field) => (
            <div
              key={field.label}
              className="col-12 col-lg-6"
            >
              <div className="border rounded p-3 h-100 bg-light-subtle">
                <div className="small text-muted mb-1">
                  {field.label}
                </div>

                <div className="fw-semibold lh-sm">
                  {field.value}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="small text-muted">
              No hay datos del diagnóstico principal para mostrar.
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end">
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
         
          onClick={onViewDiagnosticos}
        >
          Ver diagnósticos
        </CButton>
      </div>
    </div>
  );
}