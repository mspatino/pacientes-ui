export type AgendaViewMode = "day" | "week" | "month";

export interface AgendaViewProps {
  selectedDate: string;
  refreshKey: number;
}
