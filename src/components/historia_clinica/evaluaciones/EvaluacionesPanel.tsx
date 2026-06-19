import { useMemo, useState } from "react";
import {
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from "@coreui/react";
import {
  BsClipboard2Check,
  BsPencilSquare,
  BsPlusLg,
  BsTrash,
} from "react-icons/bs";
import type {
  EvaluacionDTO,
  TipoEvaluacion,
} from "../../../api/pacientes";
import {
  actualizarEvaluacion,
  crearEvaluacion,
  eliminarEvaluacion,
} from "../../../api/pacientes";
import SipacTextarea from "../../SipacTextarea";

interface EvaluacionesPanelProps {
  evaluaciones: EvaluacionDTO[];
  historiaClinicaId?: number | null;
  editable?: boolean;
  onChange?: (evaluaciones: EvaluacionDTO[]) => void;
}

const tipos: Array<{ value: TipoEvaluacion; label: string }> = [
  { value: "BECK", label: "Beck (depresión)" },
  { value: "BAI", label: "BAI (ansiedad)" },
  { value: "ASRS", label: "ASRS" },
  { value: "VINELAND", label: "Vineland" },
  { value: "ADOS", label: "ADOS" },
  { value: "OTRO", label: "Otra evaluación" },
];

const tipoLabel = (tipo: TipoEvaluacion) =>
  tipos.find((item) => item.value === tipo)?.label ?? tipo;

const nowForInput = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const toInputDate = (value?: string) => {
  if (!value) return nowForInput();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const normalizeDate = (value: string) =>
  value.length === 16 ? `${value}:00` : value;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const emptyEvaluacion = (): EvaluacionDTO => ({
  tipo: "BECK",
  fecha: nowForInput(),
  puntaje: null,
  resultado: "",
  respuestas: "",
});

export default function EvaluacionesPanel({
  evaluaciones,
  historiaClinicaId,
  editable = false,
  onChange,
}: EvaluacionesPanelProps) {
  const [draft, setDraft] = useState<EvaluacionDTO | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ordered = useMemo(
    () =>
      evaluaciones
        .map((evaluacion, index) => ({ evaluacion, index }))
        .sort(
          (a, b) =>
            new Date(b.evaluacion.fecha).getTime() -
            new Date(a.evaluacion.fecha).getTime(),
        ),
    [evaluaciones],
  );

  const openCreate = () => {
    setEditingIndex(null);
    setDraft(emptyEvaluacion());
    setError("");
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setDraft({
      ...evaluaciones[index],
      fecha: toInputDate(evaluaciones[index].fecha),
    });
    setError("");
  };

  const closeModal = () => {
    if (saving) return;
    setDraft(null);
    setEditingIndex(null);
    setError("");
  };

  const save = async () => {
    if (!draft || !onChange) return;
    if (!draft.tipo || !draft.fecha) {
      setError("El tipo y la fecha son obligatorios.");
      return;
    }

    const payload: EvaluacionDTO = {
      ...draft,
      fecha: normalizeDate(draft.fecha),
      puntaje:
        draft.puntaje === null || draft.puntaje === undefined
          ? null
          : Number(draft.puntaje),
      resultado: draft.resultado?.trim() || "",
      respuestas: draft.respuestas?.trim() || "",
    };

    setSaving(true);
    setError("");
    try {
      let saved = payload;
      if (historiaClinicaId) {
        saved =
          typeof draft.id === "number"
            ? await actualizarEvaluacion(
                historiaClinicaId,
                draft.id,
                payload,
              )
            : await crearEvaluacion(historiaClinicaId, payload);
      }

      onChange(
        editingIndex === null
          ? [...evaluaciones, saved]
          : evaluaciones.map((item, index) =>
              index === editingIndex ? saved : item,
            ),
      );
      setDraft(null);
      setEditingIndex(null);
    } catch (saveError) {
      console.error("No se pudo guardar la evaluación", saveError);
      setError("No se pudo guardar la evaluación.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (index: number) => {
    if (!onChange) return;
    const evaluacion = evaluaciones[index];
    if (!window.confirm("¿Eliminar esta evaluación?")) return;

    try {
      if (historiaClinicaId && typeof evaluacion.id === "number") {
        await eliminarEvaluacion(historiaClinicaId, evaluacion.id);
      }
      onChange(evaluaciones.filter((_, current) => current !== index));
    } catch (deleteError) {
      console.error("No se pudo eliminar la evaluación", deleteError);
      setError("No se pudo eliminar la evaluación.");
    }
  };

  return (
    <section className="sipac-hc-tab-section">
      {editable ? (
        <div className="sipac-hc-tab-section-actions">
          <button
            type="button"
            className="hc-action-btn hc-action-btn-sm d-flex align-items-center gap-2"
            onClick={openCreate}
          >
            <BsPlusLg size={13} />
            Agregar
          </button>
        </div>
      ) : null}

      {error && !draft ? (
        <div className="alert alert-danger py-2">{error}</div>
      ) : null}

      {ordered.length === 0 ? (
        <div className="small text-muted">
          Todavía no hay evaluaciones cargadas para esta historia clínica.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {ordered.map(({ evaluacion, index }) => (
            <div
              key={evaluacion.id ?? `${evaluacion.tipo}-${index}`}
              className="sipac-diagnostico-item"
            >
              <div className="d-flex justify-content-between gap-3">
                <div className="d-flex flex-column gap-1">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge rounded-pill bg-primary-subtle text-primary">
                      {tipoLabel(evaluacion.tipo)}
                    </span>
                    <span className="small text-muted">
                      {formatDate(evaluacion.fecha)}
                    </span>
                    {evaluacion.puntaje !== null &&
                    evaluacion.puntaje !== undefined ? (
                      <span className="badge rounded-pill bg-light text-dark border">
                        Puntaje: {evaluacion.puntaje}
                      </span>
                    ) : null}
                  </div>

                  {evaluacion.resultado ? (
                    <div>{evaluacion.resultado}</div>
                  ) : null}
                  {evaluacion.respuestas ? (
                    <div className="small text-muted">
                      {evaluacion.respuestas}
                    </div>
                  ) : null}
                </div>

                {editable ? (
                  <div className="d-flex align-items-start gap-1">
                    <button
                      type="button"
                      className="hc-action-btn hc-action-btn-sm"
                      aria-label="Editar evaluación"
                      onClick={() => openEdit(index)}
                    >
                      <BsPencilSquare />
                    </button>
                    <button
                      type="button"
                      className="hc-action-btn hc-action-btn-sm hc-action-btn-danger"
                      aria-label="Eliminar evaluación"
                      onClick={() => void remove(index)}
                    >
                      <BsTrash />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <CModal
        visible={Boolean(draft)}
        onClose={closeModal}
        size="lg"
        className="sipac-hc-editor-modal"
      >
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center gap-2">
            <BsClipboard2Check />
            {editingIndex === null ? "Nueva evaluación" : "Editar evaluación"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {draft ? (
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="evaluacionTipo">Tipo</CFormLabel>
                <CFormSelect
                  id="evaluacionTipo"
                  value={draft.tipo}
                  onChange={(event) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            tipo: event.target.value as TipoEvaluacion,
                          }
                        : prev,
                    )
                  }
                >
                  {tipos.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="evaluacionFecha">Fecha</CFormLabel>
                <CFormInput
                  id="evaluacionFecha"
                  type="datetime-local"
                  value={draft.fecha}
                  onChange={(event) =>
                    setDraft((prev) =>
                      prev ? { ...prev, fecha: event.target.value } : prev,
                    )
                  }
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="evaluacionPuntaje">Puntaje</CFormLabel>
                <CFormInput
                  id="evaluacionPuntaje"
                  type="number"
                  value={draft.puntaje ?? ""}
                  onChange={(event) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            puntaje: event.target.value
                              ? Number(event.target.value)
                              : null,
                          }
                        : prev,
                    )
                  }
                />
              </CCol>
              <CCol xs={12}>
                <SipacTextarea
                  id="evaluacionResultado"
                  label="Resultado"
                  value={draft.resultado || ""}
                  rows={3}
                  onChange={(value) =>
                    setDraft((prev) =>
                      prev ? { ...prev, resultado: value } : prev,
                    )
                  }
                />
              </CCol>
              <CCol xs={12}>
                <SipacTextarea
                  id="evaluacionRespuestas"
                  label="Respuestas / detalle"
                  value={draft.respuestas || ""}
                  rows={4}
                  onChange={(value) =>
                    setDraft((prev) =>
                      prev ? { ...prev, respuestas: value } : prev,
                    )
                  }
                />
              </CCol>
              {error ? (
                <CCol xs={12}>
                  <div className="alert alert-danger py-2 mb-0">{error}</div>
                </CCol>
              ) : null}
            </CRow>
          ) : null}
        </CModalBody>
        <CModalFooter className="sipac-form-footer border-top">
          <button
            type="button"
            className="sipac-toolbar-btn sipac-toolbar-btn-primary"
            onClick={() => void save()}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            className="sipac-toolbar-btn"
            onClick={closeModal}
            disabled={saving}
          >
            Cancelar
          </button>
        </CModalFooter>
      </CModal>
    </section>
  );
}
