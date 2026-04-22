import { useEffect, useMemo, useState } from "react";
import { CAlert, CBadge, CCard, CCardBody, CSpinner } from "@coreui/react";
import { getAgendaByDate, type AgendaTurno } from "../../api/agenda";
import { formatMonthTitle, getMonthCalendarDays, getMonthDates, parseLocalDate } from "./agenda.utils";
import type { AgendaViewProps } from "./agenda.types";

export default function AgendaMesPage({ selectedDate, refreshKey }: AgendaViewProps) {
  const [turnosByDay, setTurnosByDay] = useState<Record<string, AgendaTurno[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const monthDays = useMemo(() => getMonthCalendarDays(selectedDate), [selectedDate]);
  const monthDates = useMemo(() => getMonthDates(selectedDate).dates, [selectedDate]);

  useEffect(() => {
    const loadMonth = async () => {
      try {
        setLoading(true);
        setError("");
        const entries = await Promise.all(
          monthDates.map(async (date) => [date, await getAgendaByDate(date)] as const),
        );
        setTurnosByDay(Object.fromEntries(entries));
      } catch (loadError) {
        console.error("No se pudo cargar la agenda mensual", loadError);
        setError("No se pudo cargar la agenda mensual.");
      } finally {
        setLoading(false);
      }
    };

    void loadMonth();
  }, [monthDates, refreshKey]);

  if (error) {
    return (
      <CAlert color="danger" className="mb-0">
        {error}
      </CAlert>
    );
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted">
        <CSpinner size="sm" />
        Cargando agenda mensual...
      </div>
    );
  }

  return (
    <CCard className="border-0 shadow-sm">
      <CCardBody className="p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="fw-semibold text-capitalize">{formatMonthTitle(selectedDate)}</div>
          <div className="small text-muted">Vista mensual de turnos</div>
        </div>

        <div className="row row-cols-7 g-2 mb-2">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((label) => (
            <div key={label} className="col">
              <div className="small text-muted fw-semibold text-center py-2">{label}</div>
            </div>
          ))}
        </div>

        <div className="row row-cols-7 g-2">
          {monthDays.map((day) => {
            const turnos = turnosByDay[day.date] ?? [];
            const date = parseLocalDate(day.date);

            return (
              <div key={day.date} className="col">
                <div
                  className="border rounded-3 p-2 h-100"
                  style={{
                    minHeight: 110,
                    backgroundColor: day.inCurrentMonth ? "#FFFFFF" : "#F8FAFC",
                    opacity: day.inCurrentMonth ? 1 : 0.7,
                    borderColor: "#E2E8F0",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-semibold">{date.getDate()}</span>
                    {turnos.length > 0 ? (
                      <CBadge color="primary">{turnos.length}</CBadge>
                    ) : null}
                  </div>

                  <div className="d-flex flex-column gap-1">
                    {turnos.slice(0, 3).map((turno) => (
                      <div key={turno.id} className="small text-truncate rounded-2 px-2 py-1 bg-light-subtle">
                        {turno.pacienteNombre}
                      </div>
                    ))}
                    {turnos.length > 3 ? (
                      <div className="small text-muted">+{turnos.length - 3} más</div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CCardBody>
    </CCard>
  );
}

