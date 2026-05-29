import type {
  DiagnosticoDTO,
  EvolucionDiagnosticoDTO,
} from "../../../api/pacientes";
import type { TipoDiagnostico } from "../../../api/pacientes";

export const sipacBlue = "#2F6FB3";

export type DiagnosticoModalMode = "view" | "edit" | "create";

export const createEmptyDiagnostico = (): DiagnosticoDTO => ({
  descripcion: "",
  tratamiento: "",
  cie10: undefined,
  tipo: "SECUNDARIO",
  evoluciones: [],
  fechaInicio: "",
  fechaFin: "",
});

export const isDiagnosticoPrincipal = (
  diagnostico?: Pick<DiagnosticoDTO, "tipo"> | null,
) => {
  return diagnostico?.tipo === "PRINCIPAL";
};


export const isTipoDiagnostico = (value: unknown): value is TipoDiagnostico =>
  value === "PRINCIPAL" ||
  value === "SECUNDARIO" ||
  value === "FACTOR_PSICOSOCIAL" ||
  value === "EVENTO_RIESGO" ||
  value === "SINTOMA";

export const normalizeTipoDiagnostico = (tipo: unknown): TipoDiagnostico => {
  const normalized = getNormalizedTipo(tipo);
  return isTipoDiagnostico(normalized) ? normalized : "SECUNDARIO";
};

export const resolverTipoAutomatico = (codigo?: string | null): TipoDiagnostico => {
  if (!codigo?.trim()) return "SECUNDARIO";

  const upper = codigo.toUpperCase();

  if (upper.startsWith("F")) return "PRINCIPAL";
  if (upper.startsWith("Z")) return "FACTOR_PSICOSOCIAL";
  if (upper.startsWith("X")) return "EVENTO_RIESGO";
  if (upper.startsWith("R")) return "SINTOMA";

  return "SECUNDARIO";
};

export const getDiagnosticoTipoLabel = (tipo?: unknown): string => {
  const normalized = normalizeTipoDiagnostico(tipo);

  switch (normalized) {
    case "PRINCIPAL":
      return "Principal";

    case "SECUNDARIO":
      return "Secundario";

    case "FACTOR_PSICOSOCIAL":
      return "Factor psicosocial";

    case "EVENTO_RIESGO":
      return "Evento de riesgo";

    case "SINTOMA":
      return "Síntoma";

    default:
      return "Secundario";
  }
};

export const getDiagnosticoTipoBadgeStyle = (tipo?: unknown) => {
  const normalized = normalizeTipoDiagnostico(tipo);

  switch (normalized) {
    case "PRINCIPAL":
      return {
        backgroundColor: "#E8F1FB",
        color: sipacBlue,
        border: `1px solid ${sipacBlue}33`,
      };

    case "FACTOR_PSICOSOCIAL":
      return {
        backgroundColor: "#FFF4E5",
        color: "#B26A00",
        border: "1px solid #B26A0033",
      };

    case "EVENTO_RIESGO":
      return {
        backgroundColor: "#FDECEC",
        color: "#C62828",
        border: "1px solid #C6282833",
      };

    case "SINTOMA":
      return {
        backgroundColor: "#F3E8FD",
        color: "#7B1FA2",
        border: "1px solid #7B1FA233",
      };

    default:
      return {
        backgroundColor: "#F1F3F5",
        color: "#495057",
        border: "1px solid #49505722",
      };
  }
};

export const autoResizeTextarea = (element: HTMLTextAreaElement) => {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
};

export const getCie10Label = (cie10?: { codigo?: string; descripcion?: string }) => {
  if (!cie10) return "";

  const codigo = cie10.codigo ?? "";
  const descripcion = cie10.descripcion ?? "";

  return [codigo, descripcion].filter(Boolean).join(" - ");
};

const getNormalizedTipo = (tipo: unknown) => {
  if (typeof tipo === "string") return tipo.trim().toUpperCase();

  if (tipo && typeof tipo === "object") {
    const tipoRecord = tipo as Record<string, unknown>;
    const value =
      tipoRecord.nombre ?? tipoRecord.name ?? tipoRecord.codigo ?? tipoRecord.value;
    return typeof value === "string" ? value.trim().toUpperCase() : "";
  }

  return "";
};

const parseFechaHoraTime = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return Number.NaN;

  const isoTime = new Date(trimmed).getTime();
  if (!Number.isNaN(isoTime)) return isoTime;

  const localMatch = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?/,
  );

  if (!localMatch) return Number.NaN;

  const [, day, month, year, hour = "0", minute = "0"] = localMatch;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  ).getTime();
};

export const getDiagnosticoFechaFin = (
  diagnostico: DiagnosticoDTO,
) => {

  return typeof diagnostico.fechaFin === "string"
    ? diagnostico.fechaFin.trim()
    : "";
};

export const getDiagnosticoFechaInicio = (
  diagnostico: DiagnosticoDTO,
) => {

  return typeof diagnostico.fechaInicio === "string"
    ? diagnostico.fechaInicio.trim()
    : "";
};

export const isDiagnosticoActivo = (diagnostico: DiagnosticoDTO) =>
  !getDiagnosticoFechaFin(diagnostico);

export const getDiagnosticoPrincipal = (
  diagnosticos: DiagnosticoDTO[],
): DiagnosticoDTO | null => {

  const principales = diagnosticos.filter(
    (diagnostico) => diagnostico.tipo === "PRINCIPAL",
  );

  return (
    principales.find(
      (diagnostico) => !diagnostico.fechaFin,
    ) ??
    principales[0] ??
    null
  );
};

export const getLatestEvolucionDiagnostico = (
  diagnostico: Record<string, unknown>,
): Record<string, unknown> | null => {
  if (!Array.isArray(diagnostico.evoluciones) || diagnostico.evoluciones.length === 0) {
    return null;
  }

  const evoluciones = diagnostico.evoluciones.filter(
    (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object",
  );

  return evoluciones
    .map((evolucion, index) => ({
      evolucion,
      index,
      time:
        typeof evolucion.fecha === "string"
          ? parseFechaHoraTime(evolucion.fecha)
          : Number.NaN,
    }))
    .sort((a, b) => {
      const aTime = Number.isNaN(a.time) ? Number.NEGATIVE_INFINITY : a.time;
      const bTime = Number.isNaN(b.time) ? Number.NEGATIVE_INFINITY : b.time;

      if (aTime !== bTime) return bTime - aTime;
      return b.index - a.index;
    })[0]?.evolucion ?? null;
};

export const getDiagnosticoText = (
  diagnostico: DiagnosticoDTO,
  field: "descripcion" | "tratamiento" | "evolucion",
) => {

  const value = diagnostico[field];

  return typeof value === "string"
    ? value.trim()
    : "";
};

export const getDiagnosticoUltimaEvolucion = (
  diagnostico: DiagnosticoDTO,
): EvolucionDiagnosticoDTO | null => {

  const ultimaEvolucion = (diagnostico.evoluciones ?? [])
    .map((evolucion, index) => ({
      evolucion,
      index,
      time: evolucion.fecha
        ? parseFechaHoraTime(evolucion.fecha)
        : Number.NaN,
    }))
    .sort((a, b) => {
      const aTime = Number.isNaN(a.time) ? Number.NEGATIVE_INFINITY : a.time;
      const bTime = Number.isNaN(b.time) ? Number.NEGATIVE_INFINITY : b.time;

      if (aTime !== bTime) return bTime - aTime;
      return b.index - a.index;
    })[0]?.evolucion;

  return ultimaEvolucion ?? null;
};

// export const getDiagnosticoText = (
//   diagnostico: Record<string, unknown>,
//   field: "evolucion" | "tratamiento" | "descripcion",
// ) => {
//   const value = diagnostico[field];
//   if (typeof value === "string" && value.trim()) return value;

//   const latestEvolucion = getLatestEvolucionDiagnostico(diagnostico);
//   const evolucionValue = latestEvolucion?.[field];
//   return typeof evolucionValue === "string" && evolucionValue.trim() ? evolucionValue : "";
// };

// export const getDiagnosticoSummary = (diagnostico: DiagnosticoDTO): string => {
//   const cie10 = getCie10Label(diagnostico.cie10);
//   const descripcion = diagnostico.descripcion?.trim() || cie10.trim() || "";
//   return descripcion || "Sin diagnóstico";
// };
export const getDiagnosticoSummary = (
  diagnostico: DiagnosticoDTO,
): string => {
  return diagnostico.descripcion?.trim() || "Sin diagnóstico";
};

export const formatFechaHora = (value?: string | null) => {
  if (!value?.trim()) return "";

  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(fecha);
};
