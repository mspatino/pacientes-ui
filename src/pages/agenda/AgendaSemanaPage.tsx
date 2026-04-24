import { useEffect, useMemo, useState } from "react";
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CSpinner,
} from "@coreui/react";

import {
  getAgendaByWeek,
  type AgendaTurno,
} from "../../api/agenda";

import {
  estadoColor,
  formatHour,
  formatShortDayLabel,
  getWeekdays,
} from "./agenda.utils";

import type { AgendaViewProps } from "./agenda.types";

export default function AgendaSemanaPage({
  selectedDate,
  refreshKey,
}: AgendaViewProps) {
  const [turnosByDay, setTurnosByDay] = useState<
    Record<string, AgendaTurno[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const weekdays = useMemo(
    () => getWeekdays(selectedDate),
    [selectedDate],
  );

  useEffect(() => {
    const loadWeek = async () => {
      try {
        setLoading(true);
        setError("");

        const turnos = await getAgendaByWeek(selectedDate);

        const grouped = weekdays.reduce<
          Record<string, AgendaTurno[]>
        >((acc, date) => {
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

        const entries = Object.entries(grouped).map(
          ([date, dayTurnos]) => [
            date,
            [...dayTurnos].sort(
              (a, b) =>
                new Date(a.fechaHora).getTime() -
                new Date(b.fechaHora).getTime(),
            ),
          ],
        );

        setTurnosByDay(Object.fromEntries(entries));
      } catch (loadError) {
        console.error(
          "No se pudo cargar la agenda semanal",
          loadError,
        );

        setError(
          "No se pudo cargar la agenda semanal.",
        );
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
    <CRow className="g-2">
      {weekdays.map((date) => {
        const turnos = turnosByDay[date] ?? [];

        return (
          <CCol key={date} xl={4} md={6}>
            <CCard className="border-0 shadow-sm h-100">
              <CCardBody className="p-2">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div
                    className="fw-semibold text-capitalize"
                    style={{
                      fontSize: "0.9rem",
                      color: "#1E293B",
                    }}
                  >
                    {formatShortDayLabel(date)}
                  </div>

                  <CBadge
                    color="light"
                    textColor="dark"
                    style={{
                      fontSize: "0.65rem",
                    }}
                  >
                    {turnos.length}
                  </CBadge>
                </div>

                {/* SIN TURNOS */}
                {turnos.length === 0 ? (
                  <div
                    className="small text-muted"
                    style={{
                      fontSize: "0.78rem",
                    }}
                  >
                    Sin turnos
                  </div>
                ) : (
                  <div className="d-flex flex-column">

                    {turnos.map((turno, index) => (
                      <div
                        key={turno.id}
                        className="d-flex align-items-center justify-content-between py-1"
                        style={{
                          minHeight: 28,

                          borderBottom:
                            index === turnos.length - 1
                              ? "none"
                              : "1px solid #F1F5F9",

                          opacity:
                            turno.estado === "CANCELADO"
                              ? 0.55
                              : 1,
                        }}
                      >

                        {/* IZQUIERDA */}
                        <div
                          className="d-flex align-items-center gap-2 overflow-hidden"
                          style={{ minWidth: 0 }}
                        >
                          <span
                            className="small fw-semibold"
                            style={{
                              width: 42,
                              flexShrink: 0,
                              color: "#64748B",
                              fontSize: "0.72rem",
                            }}
                          >
                            {formatHour(turno.fechaHora)}
                          </span>

                          <span
                            className="text-truncate"
                            style={{
                              fontSize: "0.78rem",
                              color: "#111827",

                              textDecoration:
                                turno.estado === "CANCELADO"
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            {turno.pacienteNombre}
                          </span>
                        </div>

                        {/* ESTADO */}
                        <CBadge
                          color={estadoColor(turno.estado)}
                          style={{
                            fontSize: "0.52rem",
                            padding: "0.15rem 0.32rem",
                            flexShrink: 0,
                          }}
                        >
                          {turno.estado}
                        </CBadge>
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