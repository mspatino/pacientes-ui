import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CAlert, CForm, CSpinner } from "@coreui/react";
import DatosClinicosGeneralesCard from "../components/historia-clinica/DatosClinicosGeneralesCard";
import DiagnosticoModal from "../components/historia-clinica/DiagnosticoModal";
import DiagnosticosListCard from "../components/historia-clinica/DiagnosticosListCard";
import HistoriaClinicaEditorHeader from "../components/historia-clinica/HistoriaClinicaEditorHeader";
import { createEmptyDiagnostico } from "../components/historia-clinica/diagnosticoUtils";
import useHistoriaClinicaEditor from "../hooks/useHistoriaClinicaEditor";

interface HistoriaLocationState {
  mode?: "create";
}

export default function EditarHistoriaClinicaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as HistoriaLocationState) || {};
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
    patientIdParam: id,
    mode: state.mode,
    onSaved: (patientId) => navigate(`/pacientes/${patientId}/historia-clinica`),
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
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <HistoriaClinicaEditorHeader
          exists={exists}
          pacienteNombre={pacienteNombre}
          pageTitle={pageTitle}
          saving={saving}
          onCancel={() => navigate(-1)}
          onBack={() => navigate(-1)}
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
      </div>

      <DiagnosticoModal
        activeDiagnostico={activeDiagnostico}
        diagnosticoEditMode={diagnosticoEditMode}
        selectedIndex={selectedIndex}
        visible={diagnosticoModalVisible}
        onClose={closeDiagnosticoModal}
        onStartEdit={() => {
          setDiagnosticoDraft({ ...(selectedDiagnostico ?? createEmptyDiagnostico()) });
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
