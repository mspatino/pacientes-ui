import type { EstadoTurno } from "../../api/agenda";

export const ESTADOS: EstadoTurno[] = ["PENDIENTE", "CONFIRMADO", "AUSENTE", "CANCELADO"];

export const estadoColor = (estado: EstadoTurno) => {
  switch (estado) {
    case "CONFIRMADO":
      return "success";
    case "PENDIENTE":
      return "warning";
    case "CANCELADO":
      return "danger";
    case "AUSENTE":
      return "dark";
    default:
      return "secondary";
  }
};

export const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (raw: string) => new Date(`${raw}T00:00:00`);

export const formatDateLabel = (raw: string) => {
  const date = parseLocalDate(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatShortDayLabel = (raw: string) => {
  const date = parseLocalDate(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
};

export const formatMonthTitle = (raw: string) => {
  const date = parseLocalDate(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatHour = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
};

export const buildTurnoDateTime = (date: string, time: string) => `${date}T${time}:00`;

export const shiftDateByDays = (raw: string, days: number) => {
  const date = parseLocalDate(raw);
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
};

export const shiftDateByMonths = (raw: string, months: number) => {
  const date = parseLocalDate(raw);
  date.setMonth(date.getMonth() + months);
  return formatDateInput(date);
};

export const getWeekdays = (selectedDate: string) => {
  const base = parseLocalDate(selectedDate);
  const day = base.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + diffToMonday);

  return Array.from({ length: 5 }, (_, index) => {
    const current = new Date(base);
    current.setDate(base.getDate() + index);
    return formatDateInput(current);
  });
};

export const getMonthDates = (selectedDate: string) => {
  const base = parseLocalDate(selectedDate);
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  const dates: string[] = [];

  for (let day = 1; day <= end.getDate(); day += 1) {
    dates.push(formatDateInput(new Date(base.getFullYear(), base.getMonth(), day)));
  }

  return { start, end, dates };
};

export const getMonthCalendarDays = (selectedDate: string) => {
  const { start, end } = getMonthDates(selectedDate);
  const gridStart = new Date(start);
  const startWeekday = gridStart.getDay();
  const mondayOffset = startWeekday === 0 ? -6 : 1 - startWeekday;
  gridStart.setDate(gridStart.getDate() + mondayOffset);

  const gridEnd = new Date(end);
  const endWeekday = gridEnd.getDay();
  const sundayOffset = endWeekday === 0 ? 0 : 7 - endWeekday;
  gridEnd.setDate(gridEnd.getDate() + sundayOffset);

  const days: Array<{ date: string; inCurrentMonth: boolean }> = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    days.push({
      date: formatDateInput(cursor),
      inCurrentMonth: cursor.getMonth() === start.getMonth(),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

