import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { cilList } from "@coreui/icons";
import {
  CButton,
  CCard,
  CCardBody,
  CCollapse,
  CSpinner,
} from "@coreui/react";
import { getPacienteById } from "../api/pacientes";
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
      label: "Apellido",
      value: firstString(pacienteData ?? {}, ["apellido"]) || "-",
    },
    {
      label: "Nombre",
      value: firstString(pacienteData ?? {}, ["nombre", "nombres"]) || "-",
    },
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

  return (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 fw-bold mb-0">Paciente</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Volver
        </button>
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
    </div>
  );
}
