import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CAccordion,
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
import { BsClipboard2Pulse, BsPlusLg } from "react-icons/bs";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import {
  getHistoriaClinicaByPacienteId,
  getPacienteById,
  type HistoriaClinicaDTO,
  type PacienteResponseDTO,
} from "../../api/pacientes";

import HistoriaClinicaHeader from "../../components/historia_clinica/HistoriaClinicaHeader";
import HistoriaClinicaGeneralCard from "../../components/historia_clinica/HisoriaClinicaGeneralCard";
import HistoriaClinicaDiagnosticoCard from "../../components/historia_clinica/HistoriaClinicaDiagnosticoCard";
import {
  getDiagnosticoFechaFin,
  getDiagnosticoPrincipal,
  getDiagnosticoText,
} from "../../components/historia_clinica/diagnosticoUtils";
import { getEstadoTratamiento } from "../helpers/diagnosticoEstadoUtils";

pdfMake.addVirtualFileSystem(pdfFonts);

interface HistoriaLocationState {
  mode?: "create";
}

interface EvolucionItem {
  fecha: string;
  nota: string;
}

interface DiagnosticoPrincipal {
  evoluciones?: EvolucionItem[];
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
  const sipacBlue = "#2F6FB3";
  const sipacSoftBlue = "#E8F1FB";
 // const [activeItems, setActiveItems] = useState([1, 2]);



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
  const fields: Array<{ label: string; value: string }> = [
    ...(historiaData?.fechaAlta
      ? [
          {
            label: "Fecha de alta",
            value: formatDateTime(historiaData.fechaAlta),
          },
        ]
      : []),
    ...(hasText(historiaData?.motivoConsulta)
      ? [
          {
            label: "Motivo de consulta",
            value: valueOrDash(historiaData.motivoConsulta),
          },
        ]
      : []),
    ...(hasText(historiaData?.observaciones)
      ? [
          {
            label: "Observaciones",
            value: valueOrDash(historiaData.observaciones),
          },
        ]
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

  const diagnosticos = Array.isArray(historiaData?.diagnosticos)
    ? historiaData.diagnosticos
    : [];
  
  const diagnosticoPrincipal = getDiagnosticoPrincipal(diagnosticos);

  const diagnosticoPrincipalTyped = diagnosticoPrincipal as DiagnosticoPrincipal | null;

  const estadoTratamiento =  getEstadoTratamiento(diagnosticos);

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

  const handleDownloadPdf = () => {
    const buildInfoTable = (
      title: string,
      items: Array<{ label: string; value: string }>,
    ) => ({
      stack: [
        { text: title, style: "sectionTitle" },
        items.length > 0
          ? {
              table: {
                widths: ["34%", "66%"],
                body: items.map((item) => [
                  { text: item.label, style: "fieldLabel" },
                  { text: item.value, style: "fieldValue" },
                ]),
              },
              layout: {
                hLineColor: () => "#D6E4F4",
                vLineColor: () => "#D6E4F4",
                paddingLeft: () => 10,
                paddingRight: () => 10,
                paddingTop: () => 8,
                paddingBottom: () => 8,
              },
            }
          : {
              text: "No hay datos para mostrar.",
              style: "emptyText",
            },
      ],
    });

    const historiaFields = [
      ...(historiaData?.fechaAlta
        ? [
            {
              label: "Fecha de alta",
              value: formatDateTime(historiaData.fechaAlta),
            },
          ]
        : []),
      ...(hasEstado
        ? [
            {
              label: "Estado",
              value: historiaData?.activa ? "Activa" : "Inactiva",
            },
          ]
        : []),
      ...fields.filter((field) => field.label !== "Fecha de alta"),
    ];

    const diagnosticoFields = (() => {
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
        cie10 &&
        typeof cie10.descripcion === "string" &&
        cie10.descripcion.trim()
          ? cie10.descripcion
          : null;
      const cie10Label = [cie10Codigo, cie10Descripcion]
        .filter(Boolean)
        .join(" - ");

      return [
        ...(descripcionTexto
          ? [{ label: "Descripción clínica", value: descripcionTexto }]
          : []),
        ...(cie10Label ? [{ label: "CIE-10", value: cie10Label }] : []),
        ...(fecha ? [{ label: "Fecha", value: fecha }] : []),
        ...(fechaFin ? [{ label: "Fecha fin", value: fechaFin }] : []),
        ...(evolucion ? [{ label: "Evolución", value: evolucion }] : []),
        ...(tratamiento ? [{ label: "Tratamiento", value: tratamiento }] : []),
      ];
    })();

    const docDefinition: TDocumentDefinitions = {
      pageSize: "A4",
      pageMargins: [32, 36, 32, 36],
      content: [
        {
          table: {
            widths: [52, "*"],
            body: [
              [
                {
                  text: "HC",
                  alignment: "center",
                  color: sipacBlue,
                  bold: true,
                  fillColor: sipacSoftBlue,
                  margin: [0, 10, 0, 10],
                },
                {
                  stack: [
                    { text: "Historia clínica", style: "eyebrow" },
                    { text: pacienteNombre, style: "header" },
                  ],
                  border: [false, false, false, false],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
          margin: [0, 0, 0, 18],
        } as never,
        buildInfoTable("Datos clínicos generales", historiaFields),
        { text: "", margin: [0, 8, 0, 0] },
        buildInfoTable("Diagnóstico principal", diagnosticoFields),
      ],
      styles: {
        eyebrow: {
          fontSize: 10,
          color: "#6C7A89",
          margin: [0, 0, 0, 2],
        },
        header: {
          fontSize: 20,
          bold: true,
          color: "#16324F",
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: sipacBlue,
          margin: [0, 0, 0, 8],
        },
        fieldLabel: {
          fontSize: 10,
          color: "#6C7A89",
        },
        fieldValue: {
          fontSize: 11,
          bold: true,
          color: "#1F2D3D",
        },
        emptyText: {
          fontSize: 10,
          color: "#6C7A89",
          italics: true,
        },
      },
      defaultStyle: {
        fontSize: 10,
      },
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`Historia-clinica-${pacienteNombre.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="p-3">
      <HistoriaClinicaHeader
        pacienteNombre={pacienteNombre}
        onDownloadPdf={handleDownloadPdf}
        onDelete={() => {
          setActionError("");
          setShowDeleteModal(true);
        }}
        onBack={() => navigate(-1)}
        onEdit={() => {
          if (pacienteId) {
            navigate(`/pacientes/${pacienteId}/historia-clinica/editar`);
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
        <div className="d-flex flex-column gap-3">
          <CAccordion activeItemKey={1} className="paciente-accordion w-100">
            <HistoriaClinicaGeneralCard
              fields={fields}
              // hasEstado={hasEstado}
              // activa={historia.activa}
            />
          </CAccordion>

          <CAccordion activeItemKey={2} className="paciente-accordion w-100">
            <HistoriaClinicaDiagnosticoCard
              // diagnosticoPrincipal={diagnosticoPrincipal}
              diagnosticoFields={diagnosticoFields}
              diagnosticos={diagnosticos}
              evoluciones={diagnosticoPrincipalTyped?.evoluciones ?? []}
              onViewDiagnosticos={() => {
                if (pacienteId) {
                  navigate(`/pacientes/${pacienteId}/diagnosticos`);
                }
              }}
            />
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
                    navigate(
                      `/pacientes/${pacienteId}/historia-clinica/editar`,
                      {
                        state: { mode: "create" },
                      },
                    );
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
