import { CAlert, CForm, CSpinner } from "@coreui/react";
import DatosClinicosGeneralesCard from "../../components/historia_clinica/general/DatosClinicosGeneralesCard";
import DiagnosticoModal from "../../components/historia_clinica/diagnosticos/DiagnosticoModal";
import DiagnosticosListCard from "../../components/historia_clinica/diagnosticos/DiagnosticosListCard";
import HistoriaClinicaEditorHeader from "../../components/historia_clinica/header/HistoriaClinicaEditorHeader";
import { createEmptyDiagnostico } from "../../components/historia_clinica/diagnosticos/diagnosticoUtils";
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
    diagnosticoEditMode,
    diagnosticoModalVisible,
    error,
    exists,
    form,
    handleDiagnosticoDraftChange,
    handleSubmit,
    loading,
    openDiagnosticoModal,
    pageTitle,
    pacienteNombre,
    removeDiagnostico,
    saveDiagnosticoDraft,
    saving,
    selectedDiagnostico,
    selectedIndex,
    setDiagnosticoDraft,
    setDiagnosticoEditMode,
    setForm,
    setSelectedIndex,
    submitError,
  } = useHistoriaClinicaEditor({
    patientIdParam: patientId,
    mode,
    onSaved,
  });

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
    <div className="p-3">
      <div className="hc-container">
        <HistoriaClinicaEditorHeader
          exists={exists}
          pacienteNombre={pacienteNombre}
          pageTitle={pageTitle}
          onBack={onBack}
        />

        <CForm id="historia-clinica-form" onSubmit={handleSubmit}>
          <div className="d-flex flex-column gap-3">
            {submitError ? (
              <CAlert color="danger" className="mb-0">
                {submitError}
              </CAlert>
            ) : null}

            <DatosClinicosGeneralesCard form={form} setForm={setForm} />

            <DiagnosticosListCard
              diagnosticos={form.diagnosticos}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              onAdd={addDiagnostico}
              onView={(index) => openDiagnosticoModal(index, false)}
              onRemove={(index) => {
                removeDiagnostico(index);
                if (selectedIndex === index) setSelectedIndex(null);
              }}
            />
          </div>
        </CForm>
        <CForm id="historia-clinica-form" onSubmit={handleSubmit}>
          <div className="d-flex flex-column gap-3">...</div>

          <div className="hc-form-footer-sticky">
            <button
              type="button"
              className="sipac-toolbar-btn"
              onClick={onBack}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="sipac-toolbar-btn"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </CForm>
      </div>

      <DiagnosticoModal
        activeDiagnostico={activeDiagnostico}
        diagnosticoEditMode={diagnosticoEditMode}
        selectedIndex={selectedIndex}
        visible={diagnosticoModalVisible}
        onClose={closeDiagnosticoModal}
        onStartEdit={() => {
          setDiagnosticoDraft({
            ...(selectedDiagnostico ?? createEmptyDiagnostico()),
          });
          setDiagnosticoEditMode(true);
        }}
        onDraftChange={handleDiagnosticoDraftChange}
        onSave={saveDiagnosticoDraft}
        onRemove={() => {
          if (selectedIndex !== null) {
            removeDiagnostico(selectedIndex);
          }
        }}
      />
    </div>
  );
}
