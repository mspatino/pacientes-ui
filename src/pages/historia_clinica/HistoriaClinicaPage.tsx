import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
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
  BsBullseye,
  BsClipboard2Check,
  BsClipboard2Pulse,
  BsJournalText,
  BsPeople,
  BsPlusLg,
} from "react-icons/bs";
import { GiBrain } from "react-icons/gi";
import {
  getHistoriaClinicaByPacienteId,
  getPacienteById,
  type HistoriaClinicaDTO,
  type PacienteResponseDTO,
} from "../../api/pacientes";

import HistoriaClinicaHeader from "../../components/historia_clinica/HistoriaClinicaHeader";
import HistoriaClinicaGeneralCard from "../../components/historia_clinica/HisoriaClinicaGeneralCard";
import HistoriaClinicaDiagnosticoCard from "../../components/historia_clinica/HistoriaClinicaDiagnosticoCard";
import EvaluacionesPanel from "../../components/historia_clinica/evaluaciones/EvaluacionesPanel";
import {
  getDiagnosticoFechaFin,
  getDiagnosticoPrincipal,
  getDiagnosticoText,
} from "../../components/historia_clinica/diagnosticos/diagnosticoUtils";
import { getEstadoTratamiento } from "../helpers/diagnosticoEstadoUtils";
import useHistoriaClinicaPdf from "../../hooks/useHistoriaClinicaPdf";
import "../../styles/paciente.css";

interface HistoriaLocationState {
  mode?: "create";
  activeTab?: HistoriaClinicaTab;
}

interface EvolucionItem {
  fecha: string;
  nota: string;
}

interface DiagnosticoPrincipal {
  evoluciones?: EvolucionItem[];
}

type HistoriaClinicaTab =
  | "consulta"
  | "antecedentes"
  | "observaciones"
  | "evaluaciones"
  | "diagnosticos";



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
  const [activeTab, setActiveTab] = useState<HistoriaClinicaTab>(
    state.activeTab ?? "consulta",
  );
 
 
   //const [activeItems, setActiveItems] = useState<number[]>([1, 2]);



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
        const pacienteData: PacienteResponseDTO =
          await getPacienteById(pacienteId);
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
      setActionError(
        "No se pudo eliminar la historia clínica. Intente nuevamente.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const historiaData = historia;
  const consultaFields: Array<{ label: string; value: string }> = [
    {
      label: "Fecha de alta",
      value: historiaData?.fechaAlta
        ? formatDateTime(historiaData.fechaAlta)
        : "-",
    },
    {
      label: "Motivo de consulta",
      value: valueOrDash(historiaData?.motivoConsulta),
    },
    {
      label: "Medicación",
      value: valueOrDash(historiaData?.medicacion),
    },
    {
      label: "Consumo",
      value: valueOrDash(historiaData?.consumo),
    },
  ];

  const antecedentesFields: Array<{ label: string; value: string }> = [
    {
      label: "Antecedentes personales",
      value: valueOrDash(historiaData?.antecedentesPersonales),
    },
    {
      label: "Antecedentes familiares",
      value: valueOrDash(historiaData?.antecedentesFamiliares),
    },
    {
      label: "Contexto social",
      value: valueOrDash(historiaData?.contextoSocial),
    },
    {
      label: "Actividades de vida diaria",
      value: valueOrDash(historiaData?.actividadesVidaDiaria),
    },
  ];

  const observacionesFields: Array<{ label: string; value: string }> = [
    {
      label: "Observaciones",
      value: valueOrDash(historiaData?.observaciones),
    },
    {
      label: "Objetivos terapéuticos",
      value: valueOrDash(historiaData?.objetivosTerapeuticos),
    },
  ];

  const diagnosticos = Array.isArray(historiaData?.diagnosticos)
    ? historiaData.diagnosticos
    : [];
  const evaluaciones = Array.isArray(historiaData?.evaluaciones)
    ? historiaData.evaluaciones
    : [];
  
  const diagnosticoPrincipal = getDiagnosticoPrincipal(diagnosticos);

  const diagnosticoPrincipalTyped = diagnosticoPrincipal as DiagnosticoPrincipal | null;

  const estadoTratamiento =  getEstadoTratamiento(diagnosticos);
  const { downloadPdf } = useHistoriaClinicaPdf({
    historia: historiaData,
    pacienteNombre,
    estadoTratamiento,
  });

  const diagnosticoFields: Array<{ label: string; value: string }> = (() => {
    if (!diagnosticoPrincipal) return [];

    const item = diagnosticoPrincipal as Record<string, unknown>;

    const descripcionTexto = getDiagnosticoText(item, "descripcion") || null;

    const evolucion = getDiagnosticoText(item, "evolucion") || null;

    const tratamiento = getDiagnosticoText(item, "tratamiento") || null;

    const fecha =
      typeof item.fecha === "string" ? formatDateTime(item.fecha) : null;

    const fechaFin = getDiagnosticoFechaFin(item)
      ? formatDateTime(getDiagnosticoFechaFin(item))
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

    const cie10Label = [cie10Codigo, cie10Descripcion]
      .filter(Boolean)
      .join(" - ");

    return [
      ...(descripcionTexto
        ? [
            {
              label: "Descripción clínica",
              value: descripcionTexto,
            },
          ]
        : []),

      ...(cie10Label ? [{ label: "CIE-10", value: cie10Label }] : []),

      ...(fecha ? [{ label: "Fecha", value: fecha }] : []),

      ...(fechaFin ? [{ label: "Fecha fin", value: fechaFin }] : []),

      ...(evolucion ? [{ label: "Evolución", value: evolucion }] : []),

      ...(tratamiento ? [{ label: "Tratamiento", value: tratamiento }] : []),
    ];
  })();

  return (
    <div className="p-3 paciente-page-container">
      <HistoriaClinicaHeader
        pacienteNombre={pacienteNombre}
        onDownloadPdf={downloadPdf}
        onDelete={() => {
          setActionError("");
          setShowDeleteModal(true);
        }}
        onBack={() => navigate(-1)}
        onEdit={() => {
          if (pacienteId) {
            navigate(`/pacientes/${pacienteId}/historia-clinica/editar`, {
              state: { activeTab },
            });
          }
        }}
      />

      {historia && (
  <div className="d-flex gap-2 flex-wrap mb-3">

    {/* Estado administrativo */}
    {historia.activa ? (
      <span className="badge bg-primary-subtle text-primary px-3 py-2">
        Historia activa
      </span>
    ) : (
      <span className="badge bg-secondary-subtle text-secondary px-3 py-2">
        Historia archivada
      </span>
    )}

    {/* Estado clínico */}
    {estadoTratamiento === "EN_TRATAMIENTO" && (
      <span className="badge bg-success-subtle text-success px-3 py-2">
        En tratamiento
      </span>
    )}

    {estadoTratamiento === "ALTA_TERAPEUTICA" && (
      <span className="badge bg-info-subtle text-info px-3 py-2">
        Alta terapéutica
      </span>
    )}

    {estadoTratamiento === "SIN_DIAGNOSTICO" && (
      // <span className="badge bg-light text-dark px-3 py-2 border">
         <span className="badge bg-warning-subtle text-secondary px-3 py-2">
        Sin diagnóstico 
      </span>
    )}

  </div>
)}  


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
        <div className="sipac-hc-tabs-card">
          <div className="sipac-hc-tabs" role="tablist" aria-label="Secciones de historia clínica">
            <button
              type="button"
              className={`sipac-hc-tab ${activeTab === "consulta" ? "is-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "consulta"}
              aria-controls="historia-lectura-tab-consulta"
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
              aria-controls="historia-lectura-tab-antecedentes"
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
              aria-controls="historia-lectura-tab-observaciones"
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
              aria-controls="historia-lectura-tab-evaluaciones"
              onClick={() => setActiveTab("evaluaciones")}
            >
              <BsClipboard2Check size={15} />
              Evaluaciones
              <span className="sipac-hc-tab-count">{evaluaciones.length}</span>
            </button>

            <button
              type="button"
              className={`sipac-hc-tab ${activeTab === "diagnosticos" ? "is-active" : ""}`}
              role="tab"
              aria-selected={activeTab === "diagnosticos"}
              aria-controls="historia-lectura-tab-diagnosticos"
              onClick={() => setActiveTab("diagnosticos")}
            >
              <GiBrain size={15} />
              Diagnósticos
              <span className="sipac-hc-tab-count">{diagnosticos.length}</span>
            </button>
          </div>

          <div className="sipac-hc-tab-panel">
            <div
              id="historia-lectura-tab-consulta"
              role="tabpanel"
              hidden={activeTab !== "consulta"}
            >
              <HistoriaClinicaGeneralCard
                fields={consultaFields}
                variant="panel"
              />
            </div>

            <div
              id="historia-lectura-tab-antecedentes"
              role="tabpanel"
              hidden={activeTab !== "antecedentes"}
            >
              <HistoriaClinicaGeneralCard
                fields={antecedentesFields}
                variant="panel"
              />
            </div>

            <div
              id="historia-lectura-tab-observaciones"
              role="tabpanel"
              hidden={activeTab !== "observaciones"}
            >
              <HistoriaClinicaGeneralCard
                fields={observacionesFields}
                variant="panel"
              />
            </div>

            <div
              id="historia-lectura-tab-evaluaciones"
              role="tabpanel"
              hidden={activeTab !== "evaluaciones"}
            >
              <EvaluacionesPanel evaluaciones={evaluaciones} />
            </div>

            <div
              id="historia-lectura-tab-diagnosticos"
              role="tabpanel"
              hidden={activeTab !== "diagnosticos"}
            >
              <HistoriaClinicaDiagnosticoCard
                diagnosticoFields={diagnosticoFields}
                diagnosticos={diagnosticos}
                evoluciones={diagnosticoPrincipalTyped?.evoluciones ?? []}
                onViewDiagnosticos={() => {
                  if (pacienteId) {
                    navigate(`/pacientes/${pacienteId}/diagnosticos`);
                  }
                }}
                variant="panel"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto sipac-form-card sipac-hc-tabs-card">
  <div className="p-4">

    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">

      {/* LEFT */}
      <div className="d-flex align-items-center gap-3">

        <div className="sipac-empty-icon">
          <BsClipboard2Pulse />
        </div>

        <div>
          <h5 className="mb-1 hc-title">
            Historia clínica no registrada
          </h5>

          <div className="text-muted small">
            Este paciente todavía no posee una historia clínica cargada.
          </div>

          {state.mode === "create" ? (
            <div className="small text-muted mt-1">
              Modo alta solicitado desde detalle del paciente.
            </div>
          ) : null}
        </div>

      </div>

      {/* RIGHT */}
      <div className="d-flex align-items-center">
        <button
          type="button"
          className="sipac-toolbar-btn"
          onClick={() => {
            if (pacienteId) {
              navigate(
                `/pacientes/${pacienteId}/historia-clinica/editar`,
                {
                  state: { mode: "create" },
                },
              );
            }
          }}
        >
          <BsPlusLg />
          Crear
        </button>
      </div>

    </div>

  </div>
</div>
      )}

      <CModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
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
          <CButton
            color="primary"
            onClick={handleDeleteHistoriaClinica}
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </CButton>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
