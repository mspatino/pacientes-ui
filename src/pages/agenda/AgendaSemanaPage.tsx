import { useEffect, useMemo, useState } from "react";
import { CAlert, CBadge, CCard, CCardBody, CCol, CRow, CSpinner } from "@coreui/react";
import { BsClock } from "react-icons/bs";
import { getAgendaByWeek, type AgendaTurno } from "../../api/agenda";
import { estadoColor, formatHour, formatShortDayLabel, getWeekdays } from "./agenda.utils";
import type { AgendaViewProps } from "./agenda.types";

export default function AgendaSemanaPage({ selectedDate, refreshKey }: AgendaViewProps) {
  const [turnosByDay, setTurnosByDay] = useState<Record<string, AgendaTurno[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const weekdays = useMemo(() => getWeekdays(selectedDate), [selectedDate]);

  useEffect(() => {
    const loadWeek = async () => {
      try {
        setLoading(true);
        setError("");
        const turnos = await getAgendaByWeek(selectedDate);
        const grouped = weekdays.reduce<Record<string, AgendaTurno[]>>((acc, date) => {
          acc[date] = [];
          return acc;
        }, {});

        turnos.forEach((turno) => {
          const dayKey = turno.fechaHora.slice(0, 10);
          if (!grouped[dayKey]) {
            grouped[dayKey] = [];
          }
          grouped[dayKey].push(turno);
        });

        const entries = Object.entries(grouped).map(([date, dayTurnos]) => [
          date,
          [...dayTurnos].sort(
            (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
          ),
        ]);
        setTurnosByDay(Object.fromEntries(entries));
      } catch (loadError) {
        console.error("No se pudo cargar la agenda semanal", loadError);
        setError("No se pudo cargar la agenda semanal.");
      } finally {
        setLoading(false);
      }
    };

    void loadWeek();
  }, [selectedDate, weekdays, refreshKey]);

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
        Cargando agenda semanal...
      </div>
    );
  }

  return (
    <CRow className="g-3">
      {weekdays.map((date) => {
        const turnos = turnosByDay[date] ?? [];

        return (
          <CCol key={date} xl={4} md={6}>
            <CCard className="border-0 shadow-sm h-100">
              <CCardBody className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="fw-semibold text-capitalize">{formatShortDayLabel(date)}</div>
                  <CBadge color="light" textColor="dark">
                    {turnos.length}
                  </CBadge>
                </div>

                {turnos.length === 0 ? (
                  <div className="small text-muted">Sin turnos</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {turnos.map((turno) => (
                      <div key={turno.id} className="border rounded-3 px-2 py-2 bg-light-subtle">
                        <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                          <span className="small fw-semibold d-inline-flex align-items-center gap-1">
                            <BsClock />
                            {formatHour(turno.fechaHora)}
                          </span>
                          <CBadge color={estadoColor(turno.estado)}>{turno.estado}</CBadge>
                        </div>
                        <div className="small fw-semibold">{turno.pacienteNombre}</div>
                        {turno.notas?.trim() ? (
                          <div className="small text-muted mt-1">{turno.notas}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        );
      })}
    </CRow>
  );
}
