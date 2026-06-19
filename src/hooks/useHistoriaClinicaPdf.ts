import { useCallback } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type {
  EvaluacionDTO,
  EvolucionDiagnosticoDTO,
  HistoriaClinicaDTO,
} from "../api/pacientes";
import {
  getDiagnosticoFechaFin,
  getDiagnosticoFechaInicio,
  getDiagnosticoText,
  getDiagnosticoTipoLabel,
} from "../components/historia_clinica/diagnosticos/diagnosticoUtils";
import type { EstadoTratamiento } from "../pages/helpers/diagnosticoEstadoUtils";

pdfMake.addVirtualFileSystem(pdfFonts);

interface UseHistoriaClinicaPdfOptions {
  historia: HistoriaClinicaDTO | null;
  pacienteNombre: string;
  estadoTratamiento: EstadoTratamiento;
}

const sipacBlue = "#2F6FB3";
const sipacSoftBlue = "#E8F1FB";

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

const getEstadoClinicoLabel = (estadoTratamiento: EstadoTratamiento) => {
  switch (estadoTratamiento) {
    case "EN_TRATAMIENTO":
      return "En tratamiento";
    case "ALTA_TERAPEUTICA":
      return "Alta terapéutica";
    case "SIN_DIAGNOSTICO":
      return "Sin diagnóstico";
    default:
      return "Sin diagnóstico";
  }
};

const getEvolucionNota = (evolucion: EvolucionDiagnosticoDTO) =>
  evolucion.nota?.trim() ||
  evolucion.evolucion?.trim() ||
  evolucion.descripcion?.trim() ||
  "-";

const buildInfoTable = (
  title: string,
  items: Array<{ label: string; value: string }>,
): Content => ({
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

const getEvaluacionTipoLabel = (tipo: EvaluacionDTO["tipo"]) => {
  switch (tipo) {
    case "BECK":
      return "Beck (depresión)";
    case "BAI":
      return "BAI (ansiedad)";
    case "ASRS":
      return "ASRS";
    case "VINELAND":
      return "Vineland";
    case "ADOS":
      return "ADOS";
    case "OTRO":
      return "Otra evaluación";
  }
};

const buildEvaluacionesSection = (evaluaciones: EvaluacionDTO[]): Content => ({
  stack: [
    { text: "Evaluaciones", style: "sectionTitle" },
    evaluaciones.length > 0
      ? {
          table: {
            headerRows: 1,
            widths: ["18%", "19%", "12%", "25%", "26%"],
            body: [
              [
                { text: "Tipo", style: "tableHeader" },
                { text: "Fecha", style: "tableHeader" },
                { text: "Puntaje", style: "tableHeader" },
                { text: "Resultado", style: "tableHeader" },
                { text: "Respuestas / detalle", style: "tableHeader" },
              ],
              ...evaluaciones.map((evaluacion) => [
                {
                  text: getEvaluacionTipoLabel(evaluacion.tipo),
                  style: "fieldValue",
                },
                {
                  text: formatDateTime(evaluacion.fecha),
                  style: "fieldValue",
                },
                {
                  text:
                    evaluacion.puntaje === null ||
                    evaluacion.puntaje === undefined
                      ? "-"
                      : String(evaluacion.puntaje),
                  style: "fieldValue",
                },
                {
                  text: valueOrDash(evaluacion.resultado),
                  style: "fieldValue",
                },
                {
                  text: valueOrDash(evaluacion.respuestas),
                  style: "fieldValue",
                },
              ]),
            ],
          },
          layout: {
            hLineColor: () => "#D6E4F4",
            vLineColor: () => "#D6E4F4",
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
        }
      : {
          text: "No hay evaluaciones registradas.",
          style: "emptyText",
        },
  ],
});

const buildDiagnosticoFields = (
  diagnostico: Record<string, unknown>,
): Array<{ label: string; value: string }> => {
  const cie10 =
    diagnostico.cie10 && typeof diagnostico.cie10 === "object"
      ? (diagnostico.cie10 as Record<string, unknown>)
      : null;
  const cie10Codigo =
    cie10 && typeof cie10.codigo === "string" ? cie10.codigo.trim() : "";
  const cie10Descripcion =
    cie10 && typeof cie10.descripcion === "string"
      ? cie10.descripcion.trim()
      : "";

  return [
    {
      label: "Tipo",
      value: getDiagnosticoTipoLabel(
        typeof diagnostico.tipo === "string" ? diagnostico.tipo : undefined,
      ),
    },
    {
      label: "Descripción clínica",
      value: valueOrDash(getDiagnosticoText(diagnostico, "descripcion")),
    },
    {
      label: "CIE-10",
      value: [cie10Codigo, cie10Descripcion].filter(Boolean).join(" - ") || "-",
    },
    {
      label: "Fecha inicio",
      value: formatDateTime(getDiagnosticoFechaInicio(diagnostico)),
    },
    {
      label: "Fecha fin",
      value: formatDateTime(getDiagnosticoFechaFin(diagnostico)),
    },
    {
      label: "Tratamiento",
      value: valueOrDash(getDiagnosticoText(diagnostico, "tratamiento")),
    },
  ];
};

const buildDiagnosticosSection = (
  diagnosticos: Array<Record<string, unknown>>,
): Content => ({
  stack: [
    { text: "Diagnósticos", style: "sectionTitle" },
    ...(diagnosticos.length > 0
      ? diagnosticos.flatMap((diagnostico, index) => {
          const evoluciones = Array.isArray(diagnostico.evoluciones)
            ? (diagnostico.evoluciones as EvolucionDiagnosticoDTO[])
            : [];

          return [
            {
              text: `Diagnóstico ${index + 1}`,
              style: "subsectionTitle",
            } as Content,
            {
              table: {
                widths: ["34%", "66%"],
                body: buildDiagnosticoFields(diagnostico).map((item) => [
                  { text: item.label, style: "fieldLabel" },
                  { text: item.value, style: "fieldValue" },
                ]),
              },
              layout: {
                hLineColor: () => "#D6E4F4",
                vLineColor: () => "#D6E4F4",
                paddingLeft: () => 10,
                paddingRight: () => 10,
                paddingTop: () => 7,
                paddingBottom: () => 7,
              },
            } as Content,
            ...(evoluciones.length > 0
              ? [
                  {
                    stack: [
                      { text: "Evoluciones", style: "fieldLabel" },
                      {
                        ul: evoluciones.map(
                          (evolucion) =>
                            `${formatDateTime(evolucion.fecha)} — ${getEvolucionNota(evolucion)}`,
                        ),
                        style: "fieldValue",
                      },
                    ],
                    margin: [
                      8,
                      6,
                      0,
                      index < diagnosticos.length - 1 ? 12 : 0,
                    ],
                  } as Content,
                ]
              : []),
          ];
        })
      : [{ text: "No hay diagnósticos registrados.", style: "emptyText" }]),
  ],
});

export default function useHistoriaClinicaPdf({
  historia,
  pacienteNombre,
  estadoTratamiento,
}: UseHistoriaClinicaPdfOptions) {
  const downloadPdf = useCallback(() => {
    if (!historia) return;

    const diagnosticos = Array.isArray(historia.diagnosticos)
      ? historia.diagnosticos
      : [];
    const evaluaciones = Array.isArray(historia.evaluaciones)
      ? historia.evaluaciones
      : [];

    const consultaInicialFields = [
      {
        label: "Fecha de alta",
        value: formatDateTime(historia.fechaAlta),
      },
      {
        label: "Estado administrativo",
        value: historia.activa ? "Historia activa" : "Historia archivada",
      },
      {
        label: "Estado clínico",
        value: getEstadoClinicoLabel(estadoTratamiento),
      },
      {
        label: "Motivo de consulta",
        value: valueOrDash(historia.motivoConsulta),
      },
      {
        label: "Medicación",
        value: valueOrDash(historia.medicacion),
      },
      {
        label: "Consumo",
        value: valueOrDash(historia.consumo),
      },
    ];

    const antecedentesFields = [
      {
        label: "Antecedentes personales",
        value: valueOrDash(historia.antecedentesPersonales),
      },
      {
        label: "Antecedentes familiares",
        value: valueOrDash(historia.antecedentesFamiliares),
      },
      {
        label: "Contexto social",
        value: valueOrDash(historia.contextoSocial),
      },
      {
        label: "Actividades de vida diaria",
        value: valueOrDash(historia.actividadesVidaDiaria),
      },
    ];

    const observacionesFields = [
      {
        label: "Observaciones",
        value: valueOrDash(historia.observaciones),
      },
      {
        label: "Objetivos terapéuticos",
        value: valueOrDash(historia.objetivosTerapeuticos),
      },
    ];

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
        },
        buildInfoTable("Consulta inicial", consultaInicialFields),
        { text: "", margin: [0, 8, 0, 0] },
        buildInfoTable("Antecedentes y contexto", antecedentesFields),
        { text: "", margin: [0, 8, 0, 0] },
        buildInfoTable("Observaciones y objetivos", observacionesFields),
        { text: "", margin: [0, 8, 0, 0] },
        buildEvaluacionesSection(evaluaciones),
        { text: "", margin: [0, 8, 0, 0] },
        buildDiagnosticosSection(diagnosticos),
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
        subsectionTitle: {
          fontSize: 11,
          bold: true,
          color: "#16324F",
          margin: [0, 6, 0, 5],
        },
        tableHeader: {
          fontSize: 9,
          bold: true,
          color: sipacBlue,
          fillColor: sipacSoftBlue,
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
  }, [estadoTratamiento, historia, pacienteNombre]);

  return { downloadPdf };
}
