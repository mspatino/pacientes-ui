import { useEffect, useMemo, useState } from "react";
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CFormSwitch,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import { BsClock, BsFillEyeFill, BsPencilSquare } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import {
  cambiarEstadoTurno,
  getAgendaByDate,
  getFeriadosByYear,
  type AgendaFeriado,
  type AgendaTurno,
  type EstadoTurno,
} from "../../api/agenda";
import {
  estadoColor,
  formatDayNumber,
  formatHour,
  formatWeekdayName,
  getAvailableActions,
  getHourSlots,
} from "./agenda.utils";
import type { AgendaViewProps } from "./agenda.types";

export default function AgendaDiaPage({
  selectedDate,
  refreshKey,
}: AgendaViewProps) {
  const sipacBlue = "#2F6FB3";
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<AgendaTurno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTurnoId, setUpdatingTurnoId] = useState<number | null>(null);
  const [mostrarCancelados, setMostrarCancelados] = useState(false);
  const [turnoEnVista, setTurnoEnVista] = useState<AgendaTurno | null>(null);
  const [feriado, setFeriado] = useState<AgendaFeriado | null>(null);

  useEffect(() => {
    const loadAgenda = async () => {
      try {
        setLoading(true);
        setError("");
        const turnosData = await getAgendaByDate(selectedDate);
        setTurnos(
          [...turnosData].sort(
            (a, b) =>
              new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
          ),
        );
      } catch (loadError) {
        console.error("No se pudo cargar la agenda", loadError);
        setError("No se pudo cargar la agenda del día.");
        setTurnos([]);
      } finally {
        setLoading(false);
      }
    };

    void loadAgenda();
  }, [selectedDate, refreshKey]);

  useEffect(() => {
    const loadFeriado = async () => {
      try {
        const year = Number(selectedDate.slice(0, 4));
        const feriados = await getFeriadosByYear(year);

        setFeriado(
          feriados.find((item) => item.fecha === selectedDate) ?? null,
        );
      } catch (loadError) {
        console.warn("No se pudo cargar feriado del día", loadError);
        setFeriado(null);
      }
    };

    void loadFeriado();
  }, [selectedDate]);

  const hourSlots = useMemo(() => getHourSlots(8, 20), []);
  const visibleTurnos = useMemo(() => {
    return mostrarCancelados
      ? turnos
      : turnos.filter((t) => t.estado !== "CANCELADO");
  }, [mostrarCancelados, turnos]);
  const turnosByHour = useMemo(() => {
    const grouped = new Map<string, AgendaTurno[]>();

    visibleTurnos.forEach((turno) => {
      const hourKey = formatHour(turno.fechaHora).slice(0, 2);
      const current = grouped.get(hourKey) ?? [];
      current.push(turno);
      grouped.set(hourKey, current);
    });

    return grouped;
  }, [visibleTurnos]);

  const changeEstado = async (turnoId: number, nextEstado: EstadoTurno) => {
    const previous = turnos;
    const optimistic = turnos.map((item) =>
      item.id === turnoId ? { ...item, estado: nextEstado } : item,
    );
    setTurnos(optimistic);
    setUpdatingTurnoId(turnoId);

    try {
      const updated = await cambiarEstadoTurno(turnoId, nextEstado);
      setTurnos((current) =>
        current.map((item) => (item.id === turnoId ? updated : item)),
      );
    } catch (updateError) {
      console.error("No se pudo actualizar el turno", updateError);
      setTurnos(previous);
      setError("No se pudo actualizar el turno.");
    } finally {
      setUpdatingTurnoId(null);
    }
  };

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
        Cargando turnos...
      </div>
    );
  }

  return (
    <CCard className="border-0 shadow-sm">
      <CCardBody className="p-3 p-md-4">
        <div
          className="mb-0 d-flex align-items-center justify-content-between flex-wrap gap-3"
          style={{
            paddingBottom: "0.35rem",
          }}
        >
          {/* IZQUIERDA */}
          <div
            className="agenda-dia-header-left text-capitalize"
            style={{ color: "#1F2937" }}
          >
            <div
              className="agenda-dia-number"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {formatDayNumber(selectedDate)}
            </div>

            <div
              className="agenda-dia-weekday"
              style={{
                fontSize: "clamp(0.8rem, 1.8vw, 1.2rem)",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              {formatWeekdayName(selectedDate)}
            </div>

            {feriado ? (
              <span
                className="sipac-feriado-badge"
                title={feriado.nombre}
              >
                Feriado: {feriado.nombre}
              </span>
            ) : null}
          </div>
          <div className="sipac-check-chip d-flex align-items-center">
            <CFormSwitch
              className="sipac-check"
              label="Ver todos"
              checked={mostrarCancelados}
              onChange={(e) => setMostrarCancelados(e.target.checked)}
            />
          </div>
        </div>

        <div className="d-flex flex-column gap-0">
          {hourSlots.map((hour) => {
            const slotTurnos = turnosByHour.get(hour) ?? [];

            return (
              <div
                key={hour}
                className="d-flex align-items-stretch"
                style={{
                  minHeight: slotTurnos.length === 0 ? 32 : 0,
                  borderTop: "1px solid #E5E7EB",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: 62,
                    color: sipacBlue,
                    fontSize: "1rem",
                    borderRight: "1px solid #E5E7EB",
                    backgroundColor: "#F8FBFF",
                    flexShrink: 0,
                  }}
                >
                  {hour}
                </div>
                <div
                  className="flex-grow-1 px-1 py-0"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {slotTurnos.length === 0 ? (
                    <div
                      style={{
                        borderBottom: "1px dashed #CBD5E1",
                        height: "100%",
                      }}
                    />
                  ) : (
                    <div className="d-flex flex-column">
                      {slotTurnos.map((turno) => {
                        const availableActions = getAvailableActions(turno.estado);
                        const hasAvailableActions = availableActions.length > 0;

                        return (
                          <div
                            key={turno.id}
                            className="d-flex justify-content-between align-items-center px-1 py-1"
                            style={{
                              borderBottom: "1px solid #F1F5F9",
                              opacity: turno.estado === "CANCELADO" ? 0.55 : 1,
                            }}
                          >
                            <div className="d-flex flex-column">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                {/* <span className="fw-semibold">
                                {formatHour(turno.fechaHora)}
                              </span> */}
                                <span
                                  className="fw-semibold"
                                  style={{
                                    textDecoration:
                                      turno.estado === "CANCELADO"
                                        ? "line-through"
                                        : "none",
                                  }}
                                >
                                  {turno.pacienteNombre}
                                </span>
                                <CBadge
                                  color={estadoColor(turno.estado)}
                                  style={{
                                    fontSize: "0.62rem",
                                    padding: "0.25rem 0.4rem",
                                  }}
                                >
                                  {turno.estado}
                                </CBadge>
                              </div>
                              {turno.notas?.trim() ? (
                                <div className="small text-muted">
                                  {turno.notas}
                                </div>
                              ) : null}
                            </div>

                            <div className="d-flex align-items-center gap-1 ms-auto">
                              {/* VER */}
                              <button
                                type="button"
                                className="sipac-icon-btn"
                                onClick={() => setTurnoEnVista(turno)}
                                title="Ver turno"
                              >
                                <BsFillEyeFill size={11} />
                              </button>

                              {/* EDITAR */}
                              <button
                                type="button"
                                className="sipac-icon-btn"
                                onClick={() => {
                                  navigate(
                                    `/agenda/nuevo?fecha=${encodeURIComponent(selectedDate)}&view=day&turnoId=${turno.id}`,
                                  );
                                }}
                                title="Editar turno"
                              >
                                <BsPencilSquare size={11} />
                              </button>

                              {/* MENU ESTADOS */}

                              <CDropdown alignment="end">
                                <CDropdownToggle
                                  color="light"
                                  className="sipac-icon-btn sipac-state-toggle"
                                  disabled={!hasAvailableActions}
                                  title={
                                    hasAvailableActions
                                      ? "Cambiar estado"
                                      : "Sin cambios de estado disponibles"
                                  }
                                />

                                <CDropdownMenu className="sipac-state-menu">
                                  {availableActions.map((action) => (
                                    <CDropdownItem
                                      key={action.nextState}
                                      className="sipac-state-item"
                                      onClick={() => void changeEstado(turno.id, action.nextState)}
                                      disabled={updatingTurnoId === turno.id}
                                    >
                                      {action.label}
                                    </CDropdownItem>
                                  ))}
                                </CDropdownMenu>
                              </CDropdown>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {visibleTurnos.length === 0 ? (
          <div className="small text-muted mt-3 d-inline-flex align-items-center gap-2">
            <BsClock />
            {turnos.length > 0
              ? "No hay turnos visibles para esta fecha."
              : "No hay turnos cargados para esta fecha."}
          </div>
        ) : null}
      </CCardBody>

      <CModal
        visible={Boolean(turnoEnVista)}
        onClose={() => setTurnoEnVista(null)}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Detalle del turno</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {turnoEnVista ? (
            <div className="d-flex flex-column gap-3">
              <div>
                <div className="small text-muted">Paciente / contacto</div>
                <div className="fw-semibold">{turnoEnVista.pacienteNombre}</div>
              </div>

              <div>
                <div className="small text-muted">Hora</div>
                <div className="fw-semibold">
                  {formatHour(turnoEnVista.fechaHora)}
                </div>
              </div>

              <div>
                <div className="small text-muted">Estado</div>
                <CBadge
                  color={estadoColor(turnoEnVista.estado)}
                  style={{
                    fontSize: "0.62rem",
                    padding: "0.25rem 0.4rem",
                  }}
                >
                  {turnoEnVista.estado}
                </CBadge>
              </div>

              <div>
                <div className="small text-muted">Teléfono de contacto</div>
                <div className="fw-semibold">
                  {turnoEnVista.telefonoContacto || "-"}
                </div>
              </div>

              <div>
                <div className="small text-muted">Notas</div>
                <div className="fw-semibold">
                  {turnoEnVista.notas?.trim() || "-"}
                </div>
              </div>
            </div>
          ) : null}
        </CModalBody>
      </CModal>
    </CCard>
  );
}
