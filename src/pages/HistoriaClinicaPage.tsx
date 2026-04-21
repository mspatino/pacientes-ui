import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from "@coreui/react";
import {
  BsArrowLeft,
  BsClipboard2Pulse,
  BsJournalText,
  BsPencilSquare,
  BsPersonCircle,
  BsPlusLg,
  BsTrashFill,
} from "react-icons/bs";
import { GiBrain } from "react-icons/gi";
import {
  getHistoriaClinicaByPacienteId,
  getPacienteById,
  type HistoriaClinicaDTO,
  type PacienteResponseDTO,
} from "../api/pacientes";

interface HistoriaLocationState {
  mode?: "create";
}

const formatDateTime = (raw?: string): string => {
  if (!raw) return "-";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const valueOrDash = (value?: string | null): string => {
  if (!value) return "-";
  const trimmed = value.trim();
  return trimmed ? trimmed : "-";
};

const hasText = (value?: string | null): value is string => {
  if (typeof value !== "string") return false;
  return value.trim().length > 0;
};

export default function HistoriaClinicaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as HistoriaLocationState) || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historia, setHistoria] = useState<HistoriaClinicaDTO | null>(null);
  const [pacienteNombre, setPacienteNombre] = useState("Paciente");
  const [notFound, setNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const pacienteId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  useEffect(() => {
    const loadHistoria = async () => {
      if (!pacienteId) {
        setLoading(false);
        setError("ID de paciente inválido.");
        return;
      }

      try {
        const data = await getHistoriaClinicaByPacienteId(pacienteId);
        setHistoria(data);
      } catch (loadError) {
        console.error("No se pudo cargar historia clínica", loadError);
        setNotFound(true);
      }

      try {
        const pacienteData: PacienteResponseDTO = await getPacienteById(pacienteId);
        const apellido = (pacienteData.apellido || "").trim();
        const nombre = (pacienteData.nombre || "").trim();
        const fullName = `${apellido} ${nombre}`.trim();
        if (fullName) setPacienteNombre(fullName);
      } catch (pacienteError) {
        console.warn("No se pudo cargar nombre del paciente", pacienteError);
      } finally {
        setLoading(false);
      }
    };

    loadHistoria();
  }, [pacienteId]);

  const handleDeleteHistoriaClinica = async () => {
    if (!pacienteId) return;

    setActionError("");
    setDeleting(true);
    try {
      // Aquí iría la llamada a la API para eliminar historia clínica
      // await deleteHistoriaClinica(pacienteId);
      alert("Historia clínica eliminada (simulado)");
      setShowDeleteModal(false);
      navigate(`/pacientes/${pacienteId}`);
    } catch (error) {
      console.error("No se pudo eliminar la historia clínica", error);
      setActionError("No se pudo eliminar la historia clínica. Intente nuevamente.");
    } finally {
      setDeleting(false);
    }
  };

  const historiaData = historia;
  const fields: Array<{ label: string; value: string }> = [
    ...(historiaData?.fechaAlta
      ? [{ label: "Fecha de alta", value: formatDateTime(historiaData.fechaAlta) }]
      : []),
    ...(hasText(historiaData?.motivoConsulta)
      ? [{ label: "Motivo de consulta", value: valueOrDash(historiaData.motivoConsulta) }]
      : []),
    ...(hasText(historiaData?.observaciones)
      ? [{ label: "Observaciones", value: valueOrDash(historiaData.observaciones) }]
      : []),
    ...(hasText(historiaData?.medicacion)
      ? [{ label: "Medicación", value: valueOrDash(historiaData.medicacion) }]
      : []),
    ...(hasText(historiaData?.consumo)
      ? [{ label: "Consumo", value: valueOrDash(historiaData.consumo) }]
      : []),
    ...(hasText(historiaData?.tratamientosAnteriores)
      ? [
          {
            label: "Tratamientos anteriores",
            value: valueOrDash(historiaData.tratamientosAnteriores),
          },
        ]
      : []),
  ];

  const hasEstado = typeof historiaData?.activa === "boolean";
  const diagnosticos = Array.isArray(historiaData?.diagnosticos) ? historiaData.diagnosticos : [];
  const diagnosticoPrincipal =
    diagnosticos.find((item) => {
      const diag = item as Record<string, unknown>;
      return diag.principal === true;
    }) ?? null;

  return (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
            <BsClipboard2Pulse />
            Historia clínica
          </h1>
        </div>
        <div className="historia-clinica-actions">
          <span
            role="button"
            tabIndex={0}
            title="Editar historia clínica"
            aria-label="Editar historia clínica"
            className="paciente-action-btn is-edit"
            onClick={() => {
              if (pacienteId) navigate(`/pacientes/${pacienteId}/historia-clinica/editar`);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (pacienteId) navigate(`/pacientes/${pacienteId}/historia-clinica/editar`);
              }
            }}
          >
            <BsPencilSquare />
          </span>

          <span
            role="button"
            tabIndex={0}
            title="Eliminar historia clínica"
            aria-label="Eliminar historia clínica"
            className="paciente-action-btn is-delete"
            onClick={() => {
              setActionError("");
              setShowDeleteModal(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActionError("");
                setShowDeleteModal(true);
              }
            }}
          >
            <BsTrashFill />
          </span>

          <span
            role="button"
            tabIndex={0}
            title="Volver"
            aria-label="Volver"
            className="paciente-action-btn"
            onClick={() => navigate(-1)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(-1);
              }
            }}
          >
            <BsArrowLeft />
          </span>
        </div>
      </div>

      <div className="small text-muted d-flex align-items-center gap-2 mb-3">
        <BsPersonCircle />
        <span>
          Paciente: <span className="fw-semibold text-body">{pacienteNombre}</span>
        </span>
      </div>

      {loading ? (
        <div className="d-flex align-items-center gap-2 text-muted">
          <CSpinner size="sm" />
          Cargando detalle...
        </div>
      ) : error ? (
        <CAlert color="danger" className="mb-0">
          {error}
        </CAlert>
      ) : historia && !notFound ? (
        <div className="d-flex flex-column gap-3">
          <CAccordion
            activeItemKey={1}
            alwaysOpen
            className="paciente-accordion w-100"
          >
            <CAccordionItem itemKey={1}>
              <CAccordionHeader>
                <span className="d-inline-flex align-items-center gap-2">
                  <span className="paciente-accordion-icon">
                    <BsJournalText />
                  </span>
                  Datos clínicos generales
                </span>
                
              </CAccordionHeader>
              <CAccordionBody>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                  <div className="small text-muted">
                    Datos generales registrados para la historia clínica.
                  </div>
                  {hasEstado ? (
                    <div className="small text-muted">
                      Estado:{" "}
                      <span
                        className={`fw-semibold ${
                          historia.activa ? "text-success" : "text-danger"
                        }`}
                      >
                        {historia.activa ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  ) : null}
                </div>
                {fields.length === 0 ? (
                  <div className="text-muted small">No hay datos clínicos cargados para mostrar.</div>
                ) : (
                  <div className="row g-3">
                    {fields.map((field) => (
                      <div key={field.label} className="col-12 col-lg-6">
                        <div className="border rounded p-3 h-100 bg-light-subtle">
                          <div className="small text-muted mb-1">{field.label}</div>
                          <div className="fw-semibold lh-sm">{field.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CAccordionBody>
            </CAccordionItem>
            <CAccordionItem itemKey={2}>
              <CAccordionHeader>
                <span className="d-inline-flex align-items-center gap-2">
                  <span className="paciente-accordion-icon">
                    <GiBrain />
                  </span>
                  Diagnóstico principal
                </span>
              </CAccordionHeader>
              <CAccordionBody>
                {!diagnosticoPrincipal ? (
                  <div className="border rounded p-3 bg-light-subtle">
                    <div className="fw-semibold text-body mb-1">Sin diagnóstico principal</div>
                    <div className="small text-muted">
                      El diagnóstico principal se gestiona desde la edición de la historia clínica.
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {(() => {
                      const item = diagnosticoPrincipal as Record<string, unknown>;
                      const descripcionTexto =
                        typeof item.descripcion === "string" && item.descripcion.trim()
                          ? item.descripcion
                          : null;
                      const evolucion =
                        typeof item.evolucion === "string" && item.evolucion.trim()
                          ? item.evolucion
                          : null;
                      const tratamiento =
                        typeof item.tratamiento === "string" && item.tratamiento.trim()
                          ? item.tratamiento
                          : null;
                      const fecha = typeof item.fecha === "string" ? formatDateTime(item.fecha) : null;
                      const fechaFin =
                        typeof item.fechaFin === "string" && item.fechaFin.trim()
                          ? formatDateTime(item.fechaFin)
                          : typeof item.fecha_fin === "string" && item.fecha_fin.trim()
                            ? formatDateTime(item.fecha_fin)
                          : null;
                      const cie10 =
                        item.cie10 && typeof item.cie10 === "object"
                          ? (item.cie10 as Record<string, unknown>)
                          : null;
                      const cie10Codigo =
                        cie10 && typeof cie10.codigo === "string" && cie10.codigo.trim()
                          ? cie10.codigo
                          : null;
                      const cie10Descripcion =
                        cie10 && typeof cie10.descripcion === "string" && cie10.descripcion.trim()
                          ? cie10.descripcion
                          : null;
                      const cie10Label = [cie10Codigo, cie10Descripcion].filter(Boolean).join(" - ");
                      const descripcion = descripcionTexto ?? null;

                      const diagnosticoFields: Array<{ label: string; value: string }> = [
                        ...(descripcion ? [{ label: "Descripción clínica", value: descripcion }] : []),
                        ...(cie10Label ? [{ label: "CIE-10", value: cie10Label }] : []),
                        ...(fecha ? [{ label: "Fecha", value: fecha }] : []),
                        ...(fechaFin ? [{ label: "Fecha fin", value: fechaFin }] : []),
                        ...(evolucion ? [{ label: "Evolución", value: evolucion }] : []),
                        ...(tratamiento ? [{ label: "Tratamiento", value: tratamiento }] : []),
                      ];

                      return (
                        <div className="d-flex flex-column gap-3">
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                            <div className="small text-muted">
                              Resumen del diagnóstico principal asociado a esta historia clínica.
                            </div>
                            <div className="small text-muted">
                              Tipo: <span className="fw-semibold text-success">Principal</span>
                            </div>
                          </div>
                          <div className="row g-3">
                            {diagnosticoFields.length > 0 ? (
                              diagnosticoFields.map((field) => (
                                <div key={field.label} className="col-12 col-lg-6">
                                  <div className="border rounded p-3 h-100 bg-light-subtle">
                                    <div className="small text-muted mb-1">{field.label}</div>
                                    <div className="fw-semibold lh-sm">{field.value}</div>
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
                        </div>
                      );
                    })()}
                    <div className="d-flex justify-content-end">
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pacienteId) navigate(`/pacientes/${pacienteId}/diagnosticos`);
                        }}
                      >
                        Ver diagnósticos
                      </CButton>
                    </div>
                  </div>
                )}
              </CAccordionBody>
            </CAccordionItem>
          </CAccordion>
        </div>
      ) : (
        <CCard className="mx-auto sipac-form-card">
          <CCardBody>
            <div className="border rounded p-3 bg-light-subtle d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <span className="small text-muted">
                Este paciente todavía no tiene historia clínica.
              </span>
              <CButton
                color="primary"
                size="sm"
                className="d-inline-flex align-items-center gap-2"
                title="Agregar historia clínica"
                aria-label="Agregar historia clínica"
                onClick={() => {
                  if (pacienteId) {
                    navigate(`/pacientes/${pacienteId}/historia-clinica/editar`, {
                      state: { mode: "create" },
                    });
                  }
                }}
              >
                <BsClipboard2Pulse />
                <BsPlusLg />
                Alta
              </CButton>
            </div>
            {state.mode === "create" ? (
              <div className="small text-muted mt-2">
                Modo alta solicitado desde detalle de paciente.
              </div>
            ) : null}
          </CCardBody>
        </CCard>
      )}

      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar historia clínica</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {actionError ? (
            <CAlert color="danger" className="mb-3">
              {actionError}
            </CAlert>
          ) : null}
          <p className="mb-0">
            ¿Está seguro que desea eliminar la historia clínica del paciente{" "}
            <strong>{pacienteNombre}</strong>?
          </p>
        </CModalBody>
        <CModalFooter className="d-flex gap-2">
          <CButton color="primary" onClick={handleDeleteHistoriaClinica} disabled={deleting}>
            {deleting ? "Eliminando..." : "Eliminar"}
          </CButton>
          <CButton color="secondary" variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
