import type { AgendaTurno } from "../../api/agenda";

export type AgendaViewMode = "day" | "week" | "month";

export interface AgendaNuevoTurnoForm {
  pacienteId: number;
  pacienteNombre: string;
  telefonoContacto: string;
  hora: string;
  notas: string;
}

export interface AgendaViewProps {
  selectedDate: string;
  refreshKey: number;
}

export interface AgendaDayViewProps extends AgendaViewProps {
  onTurnoUpdated?: (turno: AgendaTurno) => void;
}
