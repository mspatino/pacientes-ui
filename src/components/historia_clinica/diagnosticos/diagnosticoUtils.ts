import type { DiagnosticoDTO } from "../../../api/pacientes";

export const sipacBlue = "#2F6FB3";

export const createEmptyDiagnostico = (): DiagnosticoDTO => ({
  descripcion: "",
  evolucion: "",
  tratamiento: "",
  cie10: undefined,
  principal: false,
  fechaFin: "",
});

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

export const isDiagnosticoPrincipal = (
  diagnostico?: Pick<DiagnosticoDTO, "principal" | "tipo"> | Record<string, unknown> | null,
) => {
  if (!diagnostico) return false;

  if (diagnostico.principal === true) return true;

  return getNormalizedTipo(diagnostico.tipo).includes("PRINCIPAL");
};

export const getDiagnosticoFechaFin = (diagnostico: Record<string, unknown>) => {
  const fechaFin =
    typeof diagnostico.fechaFin === "string"
      ? diagnostico.fechaFin.trim()
      : typeof diagnostico.fecha_fin === "string"
        ? diagnostico.fecha_fin.trim()
        : "";

  return fechaFin;
};

export const isDiagnosticoActivo = (diagnostico: Record<string, unknown>) =>
  !getDiagnosticoFechaFin(diagnostico);

export const getDiagnosticoPrincipal = (diagnosticos: Record<string, unknown>[]) => {
  const principales = diagnosticos.filter((diagnostico) =>
    isDiagnosticoPrincipal(diagnostico),
  );

  return (
    principales.find((diagnostico) => isDiagnosticoActivo(diagnostico)) ??
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

  return evoluciones[evoluciones.length - 1] ?? null;
};

export const getDiagnosticoText = (
  diagnostico: Record<string, unknown>,
  field: "evolucion" | "tratamiento" | "descripcion",
) => {
  const value = diagnostico[field];
  if (typeof value === "string" && value.trim()) return value;

  const latestEvolucion = getLatestEvolucionDiagnostico(diagnostico);
  const evolucionValue = latestEvolucion?.[field];
  return typeof evolucionValue === "string" && evolucionValue.trim() ? evolucionValue : "";
};

export const getDiagnosticoSummary = (diagnostico: DiagnosticoDTO): string => {
  const cie10 = getCie10Label(diagnostico.cie10);
  const descripcion = diagnostico.descripcion?.trim() || cie10.trim() || "";
  return descripcion || "Sin diagnóstico";
};
