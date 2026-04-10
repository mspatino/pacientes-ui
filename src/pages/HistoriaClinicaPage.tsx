import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CAlert, CButton, CCard, CCardBody, CSpinner } from "@coreui/react";
import { BsClipboard2Pulse, BsPersonCircle, BsPlusLg } from "react-icons/bs";
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
    day: "2-digit",
    month: "2-digit",
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

  if (loading) {
    return (
      <div className="p-3 d-flex align-items-center gap-2 text-muted">
        <CSpinner size="sm" />
        Cargando historia clínica...
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

  if (notFound || !historia) {
    return (
      <div className="p-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex flex-column">
            <h1 className="h4 fw-bold mb-1 d-flex align-items-center gap-2 sipac-section-title">
              <span className="sipac-section-icon">
                <BsClipboard2Pulse />
              </span>
              Historia clínica
            </h1>
            <div className="small text-muted d-flex align-items-center gap-2">
              <BsPersonCircle />
              <span>
                Paciente: <span className="fw-semibold text-body">{pacienteNombre}</span>
              </span>
            </div>
          </div>
        </div>

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
                  // Próximo paso: abrir formulario de alta de historia clínica.
                  // Por ahora dejamos señal de flujo sin implementar el alta.
                  alert("Alta de historia clínica: próximo paso de implementación.");
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
      </div>
    );
  }

  const fields: Array<{ label: string; value: string }> = [
    ...(historia.fechaAlta ? [{ label: "Fecha de alta", value: formatDateTime(historia.fechaAlta) }] : []),
    ...(hasText(historia.motivoConsulta)
      ? [{ label: "Motivo de consulta", value: valueOrDash(historia.motivoConsulta) }]
      : []),
    ...(hasText(historia.observaciones)
      ? [{ label: "Observaciones", value: valueOrDash(historia.observaciones) }]
      : []),
    ...(hasText(historia.medicacion)
      ? [{ label: "Medicación", value: valueOrDash(historia.medicacion) }]
      : []),
    ...(hasText(historia.consumo) ? [{ label: "Consumo", value: valueOrDash(historia.consumo) }] : []),
    ...(hasText(historia.tratamientosAnteriores)
      ? [{ label: "Tratamientos anteriores", value: valueOrDash(historia.tratamientosAnteriores) }]
      : []),
  ];

  const hasEstado = typeof historia.activa === "boolean";
  const diagnosticos = Array.isArray(historia.diagnosticos) ? historia.diagnosticos : [];
  const diagnosticoPrincipal =
    diagnosticos.find((item) => {
      const diag = item as Record<string, unknown>;
      return diag.principal === true;
    }) ?? null;

  return (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex flex-column">
          <h1 className="h4 fw-bold mb-1 d-flex align-items-center gap-2 sipac-section-title">
            <span className="sipac-section-icon">
              <BsClipboard2Pulse />
            </span>
            Historia clínica
          </h1>
          <div className="small text-muted d-flex align-items-center gap-2">
            <BsPersonCircle />
            <span>
              Paciente: <span className="fw-semibold text-body">{pacienteNombre}</span>
            </span>
          </div>
        </div>
        <CButton color="secondary" variant="outline" size="sm" onClick={() => navigate(-1)}>
          Volver
        </CButton>
      </div>

      <CCard className="mx-auto sipac-form-card">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="small text-muted">Detalle de historia clínica</div>
            {hasEstado ? (
              <span
                className={`badge rounded-pill hc-status-badge ${
                  historia.activa ? "hc-status-active" : "hc-status-inactive"
                }`}
              >
                {historia.activa ? "Activa" : "Inactiva"}
              </span>
            ) : null}
          </div>
          {fields.length === 0 ? (
            <div className="text-muted small">No hay datos clínicos cargados para mostrar.</div>
          ) : (
            <div className="row g-2">
            {fields.map((field) => (
              <div key={field.label} className="col-12 col-lg-6">
                <div className="border rounded p-2 h-100 bg-light-subtle">
                  <div className="small text-muted">{field.label}</div>
                  <div className="fw-semibold">{field.value}</div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CCardBody>
      </CCard>

      <CCard className="mx-auto sipac-form-card mt-3">
        <CCardBody>
          <div className="small text-muted mb-2">Diagnóstico principal</div>
          {!diagnosticoPrincipal ? (
            <div className="border rounded p-3 bg-light-subtle d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <span className="small text-muted">Sin diagnóstico principal cargado.</span>
              <CButton
                color="primary"
                size="sm"
                className="d-inline-flex align-items-center gap-2"
                onClick={() => alert("Alta de diagnóstico: próximo paso de implementación.")}
              >
                <BsPlusLg />
                Agregar diagnóstico
              </CButton>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
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
                const cie10 =
                  item.cie10 && typeof item.cie10 === "object"
                    ? (item.cie10 as Record<string, unknown>)
                    : null;
                const cie10Descripcion =
                  cie10 && typeof cie10.descripcion === "string" ? cie10.descripcion : null;
                const descripcion = descripcionTexto ?? cie10Descripcion ?? "Sin descripción";

                const diagnosticoFields: Array<{ label: string; value: string }> = [
                  { label: "Descripción", value: descripcion },
                  ...(fecha ? [{ label: "Fecha", value: fecha }] : []),
                  ...(evolucion ? [{ label: "Evolución", value: evolucion }] : []),
                  ...(tratamiento ? [{ label: "Tratamiento", value: tratamiento }] : []),
                ];

                return (
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-end">
                      <span className="badge rounded-pill hc-status-badge hc-status-active">
                        Principal
                      </span>
                    </div>
                    <div className="row g-2">
                      {diagnosticoFields.map((field) => (
                        <div key={field.label} className="col-12 col-lg-6">
                          <div className="border rounded p-2 h-100 bg-light-subtle">
                            <div className="small text-muted">{field.label}</div>
                            <div className="fw-semibold">{field.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div className="d-flex justify-content-end">
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  onClick={() => alert("Vista completa de diagnósticos: próximo paso de implementación.")}
                >
                  Ver diagnósticos
                </CButton>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
}
