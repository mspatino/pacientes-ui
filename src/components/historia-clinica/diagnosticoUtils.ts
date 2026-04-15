import type { DiagnosticoDTO } from "../../api/pacientes";

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

export const getDiagnosticoSummary = (diagnostico: DiagnosticoDTO): string => {
  const cie10 = getCie10Label(diagnostico.cie10);
  const descripcion = diagnostico.descripcion?.trim() || cie10.trim() || "";
  return descripcion || "Sin diagnóstico";
};
