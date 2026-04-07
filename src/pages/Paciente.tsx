import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  BsArrowLeftCircleFill,
  BsPencilSquare,
  BsPersonCircle,
  BsTrashFill,
} from "react-icons/bs";
import CIcon from "@coreui/icons-react";
import { cilList } from "@coreui/icons";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCollapse,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from "@coreui/react";
import { deletePaciente, getPacienteById } from "../api/pacientes";
import type { Paciente, PacienteResponseDTO } from "../api/pacientes";

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

const formatDate = (rawFecha?: string | null): string => {
  if (!rawFecha) return "-";

  const date = new Date(rawFecha);
  if (Number.isNaN(date.getTime())) return rawFecha;

  return new Intl.DateTimeFormat("es-AR").format(date);
};

export default function PacientePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { paciente } = (location.state as LocationState) || {};
  const [detalle, setDetalle] = useState<PacienteResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGeneral, setShowGeneral] = useState(true);
  const [showHistoria, setShowHistoria] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const sipacBlue = "#2F6FB3";
  const sipacDarkBlue = "#1E4F85";

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

  const historiaClinica =
    firstString(pacienteData ?? {}, [
      "historiaClinica",
      "historia_clinica",
      "historialClinico",
      "historial_clinico",
      "antecedentes",
      "evolucion",
    ]) || "-";


  const generalFields: Array<{ label: string; value: string }> = [
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
      label: "Sexo",
      value: firstString(pacienteData ?? {}, ["sexo", "genero", "género"]) || "-",
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
      label: "Dirección",
      value: firstString(pacienteData ?? {}, ["direccion", "dirección", "domicilio"]) || "-",
    },
    {
      label: "Fecha de alta",
      value: fechaAlta,
    },
  ];

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
        <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
          <BsPersonCircle color={sipacBlue} />
          {pacienteNombreCompleto}
        </h1>
        <div className="d-flex align-items-center gap-3">
          <span
            role="button"
            tabIndex={0}
            title="Editar paciente"
            aria-label="Editar paciente"
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{
              cursor: "pointer",
              fontSize: "1.1rem",
              color: sipacBlue,
              backgroundColor: "#E8F1FB",
              width: "34px",
              height: "34px",
            }}
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
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{
              cursor: "pointer",
              fontSize: "1.1rem",
              color: "#C62828",
              backgroundColor: "#FDECEC",
              width: "34px",
              height: "34px",
            }}
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
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{
              cursor: "pointer",
              fontSize: "1.1rem",
              color: sipacDarkBlue,
              backgroundColor: "#DCE9F8",
              width: "34px",
              height: "34px",
            }}
            onClick={() => navigate("/")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/");
              }
            }}
          >
            <BsArrowLeftCircleFill />
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
          <div>
            <CButton
              color="primary"
              variant="outline"
              className="mb-2 d-inline-flex align-items-center gap-2"
              onClick={() => setShowGeneral((prev) => !prev)}
            >
              <CIcon icon={cilList} size="sm" />
              Detalle
            </CButton>
            <CCollapse visible={showGeneral}>
              <CCard>
                <CCardBody>
               

                  <div className="row g-2">
                    {generalFields.map((field) => (
                      <div key={field.label} className="col-12 col-md-6">
                        <div className="border rounded p-2 h-100 bg-light-subtle">
                          <div className="small text-muted">{field.label}</div>
                          <div className="fw-semibold">{field.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                </CCardBody>
              </CCard>
            </CCollapse>
          </div>

          <div>
            <CButton
              color="primary"
              variant="outline"
              className="mb-2 d-inline-flex align-items-center gap-2"
              onClick={() => setShowHistoria((prev) => !prev)}
            >
              <CIcon icon={cilList} size="sm" />
              Historia Clinica
            </CButton>
            <CCollapse visible={showHistoria}>
              <CCard>
                <CCardBody>
                  <p className="mb-2">
                    <strong>Historia clínica:</strong> {historiaClinica}
                  </p>
                </CCardBody>
              </CCard>
            </CCollapse>
          </div>
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
            Ud. esta seguro que desea eliminar al paciente{" "}
            <strong>{pacienteNombreCompleto}</strong>?
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeletePaciente} disabled={deleting}>
            {deleting ? "Eliminando..." : "Aceptar"}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
