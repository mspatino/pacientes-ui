import { CCard, CCardBody, CCardHeader } from "@coreui/react";

export default function ConfiguracionPage() {
  return (
    <div className="paciente-page-container">
      <CCard className="sipac-form-card">
        <CCardHeader>
          <strong>Configuración del sistema</strong>
        </CCardHeader>
        <CCardBody>
          <p className="mb-0 text-muted">
            Panel reservado para administradores. Desde acá se pueden sumar
            opciones de configuración del sistema.
          </p>
        </CCardBody>
      </CCard>
    </div>
  );
}
