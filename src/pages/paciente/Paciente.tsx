import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  BsClipboard2Pulse,
  BsJournalText,
  BsPencilSquare,
  BsPlusLg,
  BsPersonCircle,
  BsTrashFill,
} from "react-icons/bs";
import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CAlert,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from "@coreui/react";
import {
  deletePaciente,
  getHistoriaClinicaByPacienteId,
  getPacienteById,
} from "../../api/pacientes";
import type { HistoriaClinicaDTO, Paciente, PacienteResponseDTO } from "../../api/pacientes";

interface LocationState {
  paciente?: Paciente;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  (value as Record<string, unknown>) || {};

const firstString = (
  source: Record<string, unknown>,
  keys: string[],
): string | null => {
  for (const key of keys) {
    const val = source[key];
    if (typeof val === "string" && val.trim()) return val;
  }
  return null;
};

const firstStringArray = (
  source: Record<string, unknown>,
  keys: string[],
): string[] => {
  for (const key of keys) {
    const val = source[key];
    if (Array.isArray(val)) {
      return val.filter((item): item is string => typeof item === "string");
    }
  }
  return [];
};

const formatDate = (rawFecha?: string | null): string => {
  if (!rawFecha) return "-";
  const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const trimmed = rawFecha.trim();
  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const safeDate = new Date(year, month - 1, day);
    return dateFormatter.format(safeDate);
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return rawFecha;

  return dateFormatter.format(date);
};

const formatEstadoCivil = (rawValue?: string | null): string => {
  if (!rawValue) return "-";
  const normalized = rawValue
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (normalized === "SOLTERO") return "Soltero/a";
  if (normalized === "CASADO") return "Casado/a";
  if (normalized === "DIVORCIADO") return "Divorciado/a";
  if (normalized === "VIUDO") return "Viudo/a";
  if (normalized === "UNION_CONVIVENCIAL") return "Unión convivencial";
  return rawValue;
};

const formatConviviente = (value: string): string =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatNivelEducativo = (rawValue?: string | null): string => {
  if (!rawValue) return "-";
  return rawValue
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function PacientePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { paciente } = (location.state as LocationState) || {};
  const [detalle, setDetalle] = useState<PacienteResponseDTO | null>(null);
  const [historiaClinica, setHistoriaClinica] = useState<HistoriaClinicaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const sipacBlue = "#2F6FB3";

  const pacienteId = useMemo(() => {
    if (paciente?.id) return paciente.id;
    if (!id) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id, paciente?.id]);

  useEffect(() => {
    const loadDetalle = async () => {
      if (!pacienteId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getPacienteById(pacienteId);
        setDetalle(data);
        try {
          const historia = await getHistoriaClinicaByPacienteId(pacienteId);
          setHistoriaClinica(historia);
        } catch (historiaError) {
          console.warn("No se pudo cargar historia clínica desde endpoint dedicado", historiaError);
        }
      } catch (error) {
        console.error("No se pudo cargar el detalle del paciente", error);
        if (paciente) {
          setDetalle(paciente as PacienteResponseDTO);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDetalle();
  }, [pacienteId, paciente]);

  const pacienteData = useMemo(() => {
    if (detalle) return asRecord(detalle);
    if (paciente) return asRecord(paciente);
    return null;
  }, [detalle, paciente]);

  const fechaAlta = formatDate(
    firstString(pacienteData ?? {}, ["fechaAlta", "fecha_alta"]),
  );
  const apellidoPaciente = firstString(pacienteData ?? {}, ["apellido"]) || "";
  const nombrePaciente = firstString(pacienteData ?? {}, ["nombre", "nombres"]) || "";
  const pacienteNombreCompleto = `${apellidoPaciente} ${nombrePaciente}`.trim() || "Paciente";

  const historiaClinicaData = asRecord(
    (historiaClinica as unknown) ??
      (pacienteData?.historiaClinica as unknown) ??
      (pacienteData?.historia_clinica as unknown),
  );
  const motivoConsulta =
    firstString(pacienteData ?? {}, ["motivoConsulta", "motivo_consulta"]) ||
    firstString(historiaClinicaData, ["motivoConsulta", "motivo_consulta"]) ||
    "-";
  const historiaClinicaId =
    (historiaClinica?.id as number | undefined) ??
    (pacienteData?.historiaClinicaId as number | undefined) ??
    (pacienteData?.historia_clinica_id as number | undefined);
  const hasHistoriaClinica = Boolean(historiaClinicaId) || motivoConsulta !== "-";
  const convivientes = firstStringArray(pacienteData ?? {}, ["convivientes"]);


  const identificacionContactoFields: Array<{ label: string; value: string }> = [
    {
      label: "DNI",
      value: firstString(pacienteData ?? {}, ["dni", "documento"]) || "-",
    },
    {
      label: "Fecha de nacimiento",
      value: formatDate(
        firstString(pacienteData ?? {}, ["fechaNacimiento", "fecha_nacimiento"]),
      ),
    },
    {
      label: "Teléfono",
      value: firstString(pacienteData ?? {}, ["telefono", "teléfono", "celular"]) || "-",
    },
    {
      label: "Email",
      value: firstString(pacienteData ?? {}, ["email", "correo"]) || "-",
    },
    {
      label: "Ocupación",
      value: firstString(pacienteData ?? {}, ["ocupacion", "ocupación"]) || "-",
    },
    {
      label: "Dirección",
      value: firstString(pacienteData ?? {}, ["direccion", "dirección", "domicilio"]) || "-",
    },
    {
      label: "Fecha de alta",
      value: fechaAlta,
    },
  ];

  const estadoConvivenciaFields: Array<{ label: string; value: string }> = [
    {
      label: "Estado civil",
      value: formatEstadoCivil(
        firstString(pacienteData ?? {}, ["estadoCivil", "estado_civil", "civilStatus"]),
      ),
    },
    {
      label: "Sexo",
      value: firstString(pacienteData ?? {}, ["sexo", "genero", "género"]) || "-",
    },
    {
      label: "Ocupación",
      value: firstString(pacienteData ?? {}, ["ocupacion", "ocupación"]) || "-",
    },
  ];
  const nivelEducativo = formatNivelEducativo(
    firstString(pacienteData ?? {}, ["nivelEducativo", "nivel_educativo"]),
  );

  const handleDeletePaciente = async () => {
    if (!pacienteId) return;

    setActionError("");
    setDeleting(true);
    try {
      await deletePaciente(pacienteId);
      setShowDeleteModal(false);
      navigate("/");
    } catch (error) {
      console.error("No se pudo eliminar el paciente", error);
      setActionError("No se pudo eliminar el paciente. Intente nuevamente.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
            <BsPersonCircle color={sipacBlue} />
            {pacienteNombreCompleto}
          </h1>
        </div>

        <div className="paciente-actions">
          <span
            role="button"
            tabIndex={0}
            title="Editar paciente"
            aria-label="Editar paciente"
            className="paciente-action-btn is-edit"
            onClick={() => {
              if (pacienteId) navigate(`/pacientes/${pacienteId}/editar`);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (pacienteId) navigate(`/pacientes/${pacienteId}/editar`);
              }
            }}
          >
            <BsPencilSquare />
          </span>

          <span
            role="button"
            tabIndex={0}
            title="Eliminar paciente"
            aria-label="Eliminar paciente"
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

        </div>
      </div>

      {loading ? (
        <div className="d-flex align-items-center gap-2 text-muted">
          <CSpinner size="sm" />
          Cargando detalle...
        </div>
      ) : pacienteData ? (
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
                  Datos del paciente
                </span>
              </CAccordionHeader>
              <CAccordionBody>
                <div className="row g-2">
                  <div className="col-12 col-lg-6">
                    <div className="border rounded p-3 h-100 bg-light-subtle">
                      <div className="d-flex flex-column gap-2">
                        {identificacionContactoFields.map((field) => (
                          <div
                            key={field.label}
                            className="d-flex justify-content-between align-items-start gap-2 border-bottom pb-1"
                          >
                            <span className="small text-muted">{field.label}</span>
                            <span className="fw-semibold text-end">{field.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="border rounded p-3 h-100 bg-light-subtle">
                      <div className="d-flex flex-column gap-2">
                        {estadoConvivenciaFields.map((field) => (
                          <div
                            key={field.label}
                            className="d-flex justify-content-between align-items-start gap-2 border-bottom pb-1"
                          >
                            <span className="small text-muted">{field.label}</span>
                            <span className="fw-semibold text-end">{field.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="d-flex justify-content-between align-items-start gap-2 mt-3">
                        <span className="small text-muted pt-1">Nivel educativo</span>
                        {nivelEducativo !== "-" ? (
                          <div className="d-flex flex-wrap justify-content-end gap-2">
                            <span className="paciente-conviviente-chip">{nivelEducativo}</span>
                          </div>
                        ) : (
                          <span className="fw-semibold">-</span>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-start gap-2 mt-3">
                        <span className="small text-muted pt-1">Convivientes</span>
                        {convivientes.length > 0 ? (
                          <div className="d-flex flex-wrap justify-content-end gap-2">
                            {convivientes.map((conviviente) => (
                              <span key={conviviente} className="paciente-conviviente-chip">
                                {formatConviviente(conviviente)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="fw-semibold">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CAccordionBody>
            </CAccordionItem>
            <CAccordionItem itemKey={2}>
              <CAccordionHeader>
                <span className="d-inline-flex align-items-center gap-2">
                  <span className="paciente-accordion-icon">
                    <BsClipboard2Pulse />
                  </span>
                  Historia clínica
                </span>
              </CAccordionHeader>
              <CAccordionBody>
                {hasHistoriaClinica ? (
                  <>
                    <div className="row g-2">
                      <div className="col-12">
                        <div className="border rounded p-2 h-100 bg-light-subtle">
                          <div className="small text-muted">Motivo de consulta</div>
                          <div className="fw-semibold">{motivoConsulta}</div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pacienteId) navigate(`/pacientes/${pacienteId}/historia-clinica`);
                        }}
                        disabled={!pacienteId}
                      >
                        Ver historia clínica
                      </CButton>
                    </div>
                  </>
                ) : (
                  <div className="row mt-3">
                    <div className="col-12 col-md-6">
                      <div className="d-flex flex-column gap-2 border rounded p-3 bg-light-subtle">
                        <span className="small text-muted">
                          Este paciente todavía no tiene historia clínica.
                        </span>
                        <CButton
                          color="primary"
                          size="sm"
                          className="d-inline-flex align-items-center gap-2 align-self-start"
                          title="Agregar historia clínica"
                          aria-label="Agregar historia clínica"
                          onClick={() => {
                            if (pacienteId) {
                              navigate(`/pacientes/${pacienteId}/historia-clinica`, {
                                state: { mode: "create" },
                              });
                            }
                          }}
                          disabled={!pacienteId}
                        >
                          <BsJournalText />
                          <BsPlusLg />
                          Alta
                        </CButton>
                      </div>
                    </div>
                  </div>
                )}
              </CAccordionBody>
            </CAccordionItem>
          </CAccordion>
        </div>
      ) : (
        <div className="alert alert-warning mb-0" role="alert">
          No se encontró información del paciente {pacienteId ? `#${pacienteId}` : ""}.
          Volvé al listado y abrí el detalle desde allí.
        </div>
      )}

      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar paciente</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {actionError ? (
            <CAlert color="danger" className="mb-3">
              {actionError}
            </CAlert>
          ) : null}
          <p className="mb-0">
            ¿Está seguro que desea eliminar al paciente{" "}
            <strong>{pacienteNombreCompleto}</strong>?
          </p>
        </CModalBody>
        <CModalFooter className="d-flex gap-2">
          <CButton color="primary" onClick={handleDeletePaciente} disabled={deleting}>
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
