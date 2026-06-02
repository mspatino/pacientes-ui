import { useCallback } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type {
  EvolucionDiagnosticoDTO,
  HistoriaClinicaDTO,
} from "../api/pacientes";
import {
  getDiagnosticoFechaFin,
  getDiagnosticoFechaInicio,
  getDiagnosticoPrincipal,
  getDiagnosticoText,
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

const hasText = (value?: string | null): value is string =>
  typeof value === "string" && value.trim().length > 0;

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

const buildEvolucionesSection = (
  evoluciones: EvolucionDiagnosticoDTO[],
): Content => ({
  stack: [
    { text: "Evoluciones del diagnóstico", style: "sectionTitle" },
    evoluciones.length > 0
      ? {
          table: {
            widths: ["28%", "72%"],
            body: evoluciones.map((evolucion) => [
              {
                text: formatDateTime(evolucion.fecha),
                style: "fieldLabel",
              },
              {
                text: getEvolucionNota(evolucion),
                style: "fieldValue",
              },
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
        }
      : {
          text: "No hay evoluciones registradas.",
          style: "emptyText",
        },
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
    const diagnosticoPrincipal = getDiagnosticoPrincipal(diagnosticos);

    const historiaFields = [
      ...(historia.fechaAlta
        ? [
            {
              label: "Fecha de alta",
              value: formatDateTime(historia.fechaAlta),
            },
          ]
        : []),
      ...(typeof historia.activa === "boolean"
        ? [
            {
              label: "Estado administrativo",
              value: historia.activa ? "Historia activa" : "Historia archivada",
            },
          ]
        : []),
      {
        label: "Estado clínico",
        value: getEstadoClinicoLabel(estadoTratamiento),
      },
      ...(hasText(historia.motivoConsulta)
        ? [
            {
              label: "Motivo de consulta",
              value: valueOrDash(historia.motivoConsulta),
            },
          ]
        : []),
      ...(hasText(historia.observaciones)
        ? [
            {
              label: "Observaciones",
              value: valueOrDash(historia.observaciones),
            },
          ]
        : []),
      ...(hasText(historia.medicacion)
        ? [{ label: "Medicación", value: valueOrDash(historia.medicacion) }]
        : []),
      ...(hasText(historia.consumo)
        ? [{ label: "Consumo", value: valueOrDash(historia.consumo) }]
        : []),
      ...(hasText(historia.tratamientosAnteriores)
        ? [
            {
              label: "Tratamientos anteriores",
              value: valueOrDash(historia.tratamientosAnteriores),
            },
          ]
        : []),
    ];

    const diagnosticoFields = (() => {
      if (!diagnosticoPrincipal) return [];

      const item = diagnosticoPrincipal as Record<string, unknown>;
      const descripcionTexto = getDiagnosticoText(item, "descripcion") || null;
      const evolucion = getDiagnosticoText(item, "evolucion") || null;
      const tratamiento = getDiagnosticoText(item, "tratamiento") || null;
      const fechaInicio = getDiagnosticoFechaInicio(item)
        ? formatDateTime(getDiagnosticoFechaInicio(item))
        : null;
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
        ...(fechaInicio ? [{ label: "Fecha inicio", value: fechaInicio }] : []),
        ...(fechaFin ? [{ label: "Fecha fin", value: fechaFin }] : []),
        ...(evolucion ? [{ label: "Evolución", value: evolucion }] : []),
        ...(tratamiento ? [{ label: "Tratamiento", value: tratamiento }] : []),
      ];
    })();

    const evoluciones = (
      diagnosticoPrincipal?.evoluciones as EvolucionDiagnosticoDTO[] | undefined
    ) ?? [];

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
        buildInfoTable("Datos clínicos generales", historiaFields),
        { text: "", margin: [0, 8, 0, 0] },
        buildInfoTable("Diagnóstico principal", diagnosticoFields),
        { text: "", margin: [0, 8, 0, 0] },
        buildEvolucionesSection(evoluciones),
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
  }, [estadoTratamiento, historia, pacienteNombre]);

  return { downloadPdf };
}
