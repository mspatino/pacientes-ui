import {
  CAlert,
  CForm,
  CSpinner,
} from "@coreui/react";
import { useState } from "react";
import {
  BsBullseye,
  BsClipboard2Check,
  BsClipboard2Pulse,
  BsJournalText,
  BsPeople,
} from "react-icons/bs";
import { GiBrain } from "react-icons/gi";
import DatosClinicosGeneralesCard from "../../components/historia_clinica/general/DatosClinicosGeneralesCard";
import EvaluacionesPanel from "../../components/historia_clinica/evaluaciones/EvaluacionesPanel";
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

type HistoriaClinicaTab =
  | "consulta"
  | "antecedentes"
  | "observaciones"
  | "evaluaciones"
  | "diagnosticos";

export default function HistoriaClinicaContainer({
  patientId,
  mode,
  onBack,
  onSaved,
}: HistoriaClinicaContainerProps) {
  const [activeTab, setActiveTab] = useState<HistoriaClinicaTab>("consulta");
  const {
    activeDiagnostico,
    addDiagnostico,
    closeDiagnosticoModal,
    diagnosticoModalVisible,
    editDiagnostico,
    editingIndex,
    error,
    form,
    historiaClinicaId,
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

        <div className="sipac-hc-tabs-card sipac-hc-editor-card">
          <div
            className="sipac-hc-tabs sipac-hc-tabs-editor"
            role="tablist"
            aria-label="Secciones de historia clínica"
          >
            <button
              type="button"
              className={`sipac-hc-tab ${activeTab === "consulta" ? "is-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "consulta"}
              aria-controls="historia-tab-consulta"
              onClick={() => setActiveTab("consulta")}
            >
              <BsJournalText size={15} />
              Consulta inicial
            </button>

            <button
              type="button"
              className={`sipac-hc-tab ${activeTab === "antecedentes" ? "is-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "antecedentes"}
              aria-controls="historia-tab-antecedentes"
              onClick={() => setActiveTab("antecedentes")}
            >
              <BsPeople size={15} />
              Antecedentes y contexto
            </button>

            <button
              type="button"
              className={`sipac-hc-tab ${activeTab === "observaciones" ? "is-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "observaciones"}
              aria-controls="historia-tab-observaciones"
              onClick={() => setActiveTab("observaciones")}
            >
              <BsBullseye size={15} />
              Observaciones y objetivos
            </button>

            <button
              type="button"
              className={`sipac-hc-tab ${activeTab === "evaluaciones" ? "is-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "evaluaciones"}
              aria-controls="historia-tab-evaluaciones"
              onClick={() => setActiveTab("evaluaciones")}
            >
              <BsClipboard2Check size={15} />
              Evaluaciones
              <span className="sipac-hc-tab-count">{form.evaluaciones.length}</span>
            </button>

            <button
              type="button"
              className={`sipac-hc-tab ${activeTab === "diagnosticos" ? "is-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "diagnosticos"}
              aria-controls="historia-tab-diagnosticos"
              onClick={() => setActiveTab("diagnosticos")}
            >
              <GiBrain size={15} />
              Diagnósticos
              <span className="sipac-hc-tab-count">{form.diagnosticos.length}</span>
            </button>
          </div>

          <div className="sipac-hc-tab-panel">
            {submitError ? (
              <CAlert color="danger" className="mb-3">
                {submitError}
              </CAlert>
            ) : null}

            <CForm id="historia-clinica-form" onSubmit={handleSubmit}>
              <div
                id="historia-tab-consulta"
                role="tabpanel"
                hidden={activeTab !== "consulta"}
              >
                <DatosClinicosGeneralesCard
                  form={form}
                  setForm={setForm}
                  section="consulta"
                  variant="panel"
                />
              </div>

              <div
                id="historia-tab-antecedentes"
                role="tabpanel"
                hidden={activeTab !== "antecedentes"}
              >
                <DatosClinicosGeneralesCard
                  form={form}
                  setForm={setForm}
                  section="antecedentes"
                  variant="panel"
                />
              </div>

              <div
                id="historia-tab-observaciones"
                role="tabpanel"
                hidden={activeTab !== "observaciones"}
              >
                <DatosClinicosGeneralesCard
                  form={form}
                  setForm={setForm}
                  section="observaciones"
                  variant="panel"
                />
              </div>

              <div
                id="historia-tab-evaluaciones"
                role="tabpanel"
                hidden={activeTab !== "evaluaciones"}
              >
                <EvaluacionesPanel
                  evaluaciones={form.evaluaciones}
                  historiaClinicaId={historiaClinicaId}
                  editable
                  onChange={(evaluaciones) =>
                    setForm((prev) => ({ ...prev, evaluaciones }))
                  }
                />
              </div>

              <div
                id="historia-tab-diagnosticos"
                role="tabpanel"
                hidden={activeTab !== "diagnosticos"}
              >
                <DiagnosticosListCard
                  diagnosticos={form.diagnosticos}
                  onOpen={openDiagnosticoModal}
                  onAdd={addDiagnostico}
                  onEdit={editDiagnostico}
                  onRemove={removeDiagnosticoFromList}
                  readOnly={readOnlyDiagnosticos}
                  variant="panel"
                />
              </div>

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
          </div>
        </div>
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
