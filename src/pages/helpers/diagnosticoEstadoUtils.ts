import {
  getDiagnosticoFechaFin,
  isDiagnosticoPrincipal,
} from "../../components/historia_clinica/diagnosticos/diagnosticoUtils";

export const tieneTratamientoActivo = (
  diagnosticos: unknown[],
): boolean => {

  return diagnosticos.some((d) => {

    const item = d as Record<string, unknown>;

    return isDiagnosticoPrincipal(item) && !getDiagnosticoFechaFin(item);
  });
};

export type EstadoTratamiento =
  | "EN_TRATAMIENTO"
  | "ALTA_TERAPEUTICA"
  | "SIN_DIAGNOSTICO";

export const getEstadoTratamiento = (
  diagnosticos: unknown[],
): EstadoTratamiento => {

  const principalActivo = diagnosticos.some((d) => {
    const item = d as Record<string, unknown>;

    return isDiagnosticoPrincipal(item) && !getDiagnosticoFechaFin(item);
  });

  if (principalActivo) {
    return "EN_TRATAMIENTO";
  }

  const principalConAlta = diagnosticos.some((d) => {
    const item = d as Record<string, unknown>;

    return isDiagnosticoPrincipal(item) && Boolean(getDiagnosticoFechaFin(item));
  });

  if (principalConAlta) {
    return "ALTA_TERAPEUTICA";
  }

  return "SIN_DIAGNOSTICO";
};
