import {
  CAccordion,
  CAlert,
  CCard,
  CCardBody,
  CForm,
  CSpinner,
} from "@coreui/react";
import { BsClipboard2Pulse } from "react-icons/bs";
import DatosClinicosGeneralesCard from "../../components/historia_clinica/general/DatosClinicosGeneralesCard";
import DiagnosticoModal from "../../components/historia_clinica/diagnosticos/DiagnosticoModal";
import DiagnosticosListCard from "../../components/historia_clinica/diagnosticos/DiagnosticosListCard";
import PacienteFormHeader from "../../components/pacientes/PacienteFormHeader";
import useHistoriaClinicaEditor from "../../hooks/useHistoriaClinicaEditor";

interface HistoriaClinicaContainerProps {
  patientId?: string;
  mode?: "create";
  onBack: () => void;
  onSaved: (patientId: number) => void;
}

export default function HistoriaClinicaContainer({
  patientId,
  mode,
  onBack,
  onSaved,
}: HistoriaClinicaContainerProps) {
  const {
    activeDiagnostico,
    addDiagnostico,
    closeDiagnosticoModal,
    diagnosticoModalVisible,
    editDiagnostico,
    editingIndex,
    error,
    form,
    handleDiagnosticoDraftChange,
    handleSubmit,
    loading,
    modalMode,
    openDiagnosticoModal,
    pageTitle,
    pacienteNombre,
    reloadHistoriaClinica,
    removeDiagnosticoFromList,
    saveDiagnosticoDraft,
    saving,
    setForm,
    submitError,
  } = useHistoriaClinicaEditor({
    patientIdParam: patientId,
    mode,
    onSaved,
  });

  const readOnlyDiagnosticos = form.activa === false;

  if (loading) {
    return (
      <div className="p-3 d-flex align-items-center gap-2 text-muted">
        <CSpinner size="sm" />
        Cargando formulario...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <CAlert color="danger" className="mb-0">
          {error}
        </CAlert>
      </div>
    );
  }

  return (
    <div className="p-3 paciente-page-container sipac-form-compact">
      <div className="mx-auto sipac-form-card">
        <PacienteFormHeader
          title={pageTitle}
          subtitle={`Paciente: ${pacienteNombre}`}
          icon={<BsClipboard2Pulse />}
          onBack={onBack}
        />

        <CCard>
          <CCardBody>
            {submitError ? (
              <CAlert color="danger" className="mb-3">
                {submitError}
              </CAlert>
            ) : null}

            <CForm id="historia-clinica-form" onSubmit={handleSubmit}>
              <CAccordion
                activeItemKey={1}
                alwaysOpen
                className="paciente-accordion w-100"
              >
                <DatosClinicosGeneralesCard form={form} setForm={setForm} />

                <DiagnosticosListCard
                  diagnosticos={form.diagnosticos}
                  onOpen={openDiagnosticoModal}
                  onAdd={addDiagnostico}
                  onEdit={editDiagnostico}
                  onRemove={removeDiagnosticoFromList}
                  readOnly={readOnlyDiagnosticos}
                />
              </CAccordion>

              <div className="sipac-form-footer">
                <button
                  type="submit"
                  className="sipac-toolbar-btn sipac-toolbar-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>

                <button
                  type="button"
                  className="sipac-toolbar-btn"
                  onClick={onBack}
                >
                  Cancelar
                </button>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </div>

      <DiagnosticoModal
        activeDiagnostico={activeDiagnostico}
        editingIndex={editingIndex}
        mode={modalMode}
        visible={diagnosticoModalVisible}
        onClose={closeDiagnosticoModal}
        onDraftChange={handleDiagnosticoDraftChange}
        onSave={saveDiagnosticoDraft}
        onDiagnosticoReload={reloadHistoriaClinica}
        readOnly={readOnlyDiagnosticos}
      />
    </div>
  );
}
