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

const calcularResultadoEvaluacion = (
  tipo: TipoEvaluacion,
  puntaje?: number | null,
): string => {
  if (puntaje === null || puntaje === undefined || Number.isNaN(puntaje)) {
    return "";
  }

  if (tipo === "BECK") {
    if (puntaje >= 1 && puntaje <= 10) {
      return "Estos altibajos se consideran normales";
    }
    if (puntaje >= 11 && puntaje <= 16) {
      return "Alteración leve del estado de ánimo";
    }
    if (puntaje >= 17 && puntaje <= 20) {
      return "Depresión clínica límite";
    }
    if (puntaje >= 21 && puntaje <= 30) {
      return "Depresión moderada";
    }
    if (puntaje >= 31 && puntaje <= 40) {
      return "Depresión grave";
    }
    if (puntaje > 40) {
      return "Depresión extrema";
    }
  }

  return "";
};

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
    const initial = emptyEvaluacion();
    setDraft({
      ...initial,
      resultado: calcularResultadoEvaluacion(initial.tipo, initial.puntaje),
    });
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

  const updateTipo = (tipo: TipoEvaluacion) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            tipo,
            resultado: calcularResultadoEvaluacion(tipo, prev.puntaje),
          }
        : prev,
    );
  };

  const updatePuntaje = (value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const puntaje = value ? Number(value) : null;
      return {
        ...prev,
        puntaje,
        resultado: calcularResultadoEvaluacion(prev.tipo, puntaje),
      };
    });
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
      respuestas: draft.respuestas?.trim() || "",
    };
    payload.resultado =
      calcularResultadoEvaluacion(payload.tipo, payload.puntaje) ||
      draft.resultado?.trim() ||
      "";

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
            className="hc-action-btn hc-action-btn-sm sipac-section-add-btn d-flex align-items-center gap-2"
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
              className="sipac-diagnostico-item sipac-diagnostico-compact sipac-evaluacion-item"
            >
              <div className="sipac-evaluacion-row">
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
                    <div className="sipac-evaluacion-resultado">{evaluacion.resultado}</div>
                  ) : null}
                  {evaluacion.respuestas ? (
                    <div className="small text-muted">
                      {evaluacion.respuestas}
                    </div>
                  ) : null}
                </div>

                {editable ? (
                  <div className="sipac-item-actions">
                    <button
                      type="button"
                      className="hc-action-btn hc-action-btn-sm d-flex align-items-center gap-1"
                      aria-label="Editar evaluación"
                      title="Editar evaluación"
                      onClick={() => openEdit(index)}
                    >
                      <BsPencilSquare size={13} />
                      <span className="sipac-action-label">Editar</span>
                    </button>
                    <button
                      type="button"
                      className="hc-action-btn hc-action-btn-sm hc-action-btn-danger d-flex align-items-center gap-1"
                      aria-label="Eliminar evaluación"
                      title="Eliminar evaluación"
                      onClick={() => void remove(index)}
                    >
                      <BsTrash size={13} />
                      <span className="sipac-action-label">Eliminar</span>
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
        <CModalHeader
          style={{
            backgroundColor: "#F3F4F7",
            borderBottom: "1px solid #E5E7EB",
            paddingTop: "0.9rem",
            paddingBottom: "0.9rem",
          }}
        >
          <CModalTitle
            className="d-flex align-items-center gap-2"
            style={{
              color: "#2F6FB3",
              fontWeight: 600,
            }}
          >
            <BsClipboard2Check size={20} color="#2F6FB3" />
            {editingIndex === null ? "Nueva evaluación" : "Editar evaluación"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="sipac-evaluacion-modal-body">
          {draft ? (
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel className="sipac-label" htmlFor="evaluacionTipo">
                  Tipo
                </CFormLabel>
                <CFormSelect
                  id="evaluacionTipo"
                  className="sipac-input"
                  value={draft.tipo}
                  onChange={(event) =>
                    updateTipo(event.target.value as TipoEvaluacion)
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
                <CFormLabel className="sipac-label" htmlFor="evaluacionFecha">
                  Fecha
                </CFormLabel>
                <CFormInput
                  id="evaluacionFecha"
                  className="sipac-input"
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
                <CFormLabel className="sipac-label" htmlFor="evaluacionPuntaje">
                  Puntaje
                </CFormLabel>
                <CFormInput
                  id="evaluacionPuntaje"
                  className="sipac-input"
                  type="number"
                  value={draft.puntaje ?? ""}
                  onChange={(event) =>
                    updatePuntaje(event.target.value)
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
            className="sipac-toolbar-btn"
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
