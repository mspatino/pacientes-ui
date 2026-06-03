import { useEffect, useMemo, useState } from "react";
import { CAlert, CCard, CCardBody, CSpinner } from "@coreui/react";
import { useNavigate } from "react-router-dom";
import {
  getAgendaByMonth,
  getFeriadosByYear,
  type AgendaFeriado,
  type AgendaTurno,
} from "../../api/agenda";

import {
  getMonthCalendarDays,
  getMonthDates,
  parseLocalDate,
} from "./agenda.utils";

import type { AgendaViewProps } from "./agenda.types";

export default function AgendaMesPage({
  selectedDate,
  refreshKey,
}: AgendaViewProps) {
  const [turnosByDay, setTurnosByDay] = useState<Record<string, AgendaTurno[]>>(
    {},
  );
  const [feriadosByDay, setFeriadosByDay] = useState<Record<string, AgendaFeriado>>(
    {},
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const monthDays = useMemo(
    () => getMonthCalendarDays(selectedDate),
    [selectedDate],
  );

  const monthDates = useMemo(
    () => getMonthDates(selectedDate).dates,
    [selectedDate],
  );

  const today = new Date();

  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const navigate = useNavigate();

  useEffect(() => {
    const loadMonth = async () => {
      try {
        setLoading(true);
        setError("");

        const turnos = await getAgendaByMonth(selectedDate);

        const grouped = monthDates.reduce<Record<string, AgendaTurno[]>>(
          (acc, date) => {
            acc[date] = [];
            return acc;
          },
          {},
        );

        turnos.forEach((turno) => {
          const dayKey = turno.fechaHora.slice(0, 10);

          if (!grouped[dayKey]) {
            grouped[dayKey] = [];
          }

          grouped[dayKey].push(turno);
        });

        setTurnosByDay(grouped);
      } catch (loadError) {
        console.error("No se pudo cargar la agenda mensual", loadError);

        setError("No se pudo cargar la agenda mensual.");
      } finally {
        setLoading(false);
      }
    };

    void loadMonth();
  }, [monthDates, refreshKey, selectedDate]);

  useEffect(() => {
    const loadFeriados = async () => {
      try {
        const year = Number(selectedDate.slice(0, 4));
        const feriados = await getFeriadosByYear(year);

        setFeriadosByDay(
          Object.fromEntries(
            feriados
              .filter((feriado) => feriado.fecha)
              .map((feriado) => [feriado.fecha, feriado]),
          ),
        );
      } catch (loadError) {
        console.warn("No se pudieron cargar los feriados", loadError);
        setFeriadosByDay({});
      }
    };

    void loadFeriados();
  }, [selectedDate]);

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
      <CCardBody className="p-0">
        {/* HEADER */}

        {/* CALENDARIO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderTop: "1px solid #E5E7EB",
            borderLeft: "1px solid #E5E7EB",
          }}
        >
          {/* HEADER DIAS */}
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((label) => (
            <div
              key={label}
              style={{
                borderRight: "1px solid #E5E7EB",
                borderBottom: "1px solid #E5E7EB",
                backgroundColor: "#F8FAFC",
                padding: "8px 4px",
                textAlign: "center",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#64748B",
              }}
            >
              {label}
            </div>
          ))}

          {/* CELDAS */}
          {monthDays.map((day) => {
            const turnos = turnosByDay[day.date] ?? [];
            const feriado = feriadosByDay[day.date];

            const date = parseLocalDate(day.date);

            const isToday = day.date === todayKey;
            const baseBackground = feriado
              ? "#FFF8E8"
              : day.inCurrentMonth
                ? "#FFFFFF"
                : "#F8FAFC";

            return (
              <div
                key={day.date}
                onClick={() => navigate(`/agenda?view=day&fecha=${day.date}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = feriado
                    ? "#FFF3D6"
                    : day.inCurrentMonth
                      ? "#F8FBFF"
                      : "#F1F5F9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = baseBackground;
                }}
                style={{
                  height: 120,

                  borderRight: feriado ? "1px solid #F1D7A1" : "1px solid #E5E7EB",

                  borderBottom: feriado ? "1px solid #F1D7A1" : "1px solid #E5E7EB",

                  padding: 4,

                  backgroundColor: baseBackground,

                  opacity: day.inCurrentMonth ? 1 : 0.5,

                  overflow: "hidden",

                  cursor: "pointer",

                  transition: "background-color 0.15s ease",
                }}
              >
                {/* NUMERO DIA */}
                <div className="d-flex justify-content-end mb-1">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: 24,
                      height: 24,

                      borderRadius: "50%",

                      backgroundColor: isToday ? "#2F6FB3" : "transparent",

                      color: isToday ? "#FFFFFF" : feriado ? "#8A5A00" : "#111827",

                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    {date.getDate()}
                  </div>
                </div>

                {feriado ? (
                  <div
                    className="text-truncate"
                    title={feriado.nombre}
                    style={{
                      marginBottom: 3,
                      padding: "1px 5px",
                      borderRadius: 999,
                      backgroundColor: "#FFE8AE",
                      color: "#7A4E00",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      lineHeight: 1.25,
                    }}
                  >
                    Feriado
                  </div>
                ) : null}

                {/* TURNOS */}
                <div
                  className="d-flex flex-column"
                  style={{
                    gap: 2,
                  }}
                >
                  {turnos.slice(0, 3).map((turno) => (
                    <div
                      key={turno.id}
                      className="text-truncate"
                      style={{
                        fontSize: "0.68rem",

                        lineHeight: 1.2,

                        padding: "1px 4px",

                        borderRadius: 4,

                        backgroundColor: "#E8F1FB",

                        color: "#1E3A5F",

                        fontWeight: 500,
                      }}
                    >
                      {turno.pacienteNombre}
                    </div>
                  ))}
                  {turnos.length > 3 ? (
                    <div
                      title={turnos
                        .slice(3)
                        .map((t) => t.pacienteNombre)
                        .join("\n")}
                      style={{
                        fontSize: "0.65rem",
                        color: "#475569",
                        paddingLeft: 4,
                        cursor: "pointer",
                        fontWeight: 600,
                        marginTop: 1,
                        userSelect: "none",
                      }}
                    >
                      +{turnos.length - 4} más...
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CCardBody>
    </CCard>
  );
}
