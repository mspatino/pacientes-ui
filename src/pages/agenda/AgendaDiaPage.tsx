import { useEffect, useMemo, useState } from "react";
import { CAlert, CBadge, CCard, CCardBody, CCol, CRow, CSpinner } from "@coreui/react";
import { BsClock, BsPerson } from "react-icons/bs";
import { getAgendaByDate, updateTurno, type AgendaTurno } from "../../api/agenda";
import { ESTADOS, estadoColor, formatHour } from "./agenda.utils";
import type { AgendaDayViewProps } from "./agenda.types";

export default function AgendaDiaPage({ selectedDate, refreshKey, onTurnoUpdated }: AgendaDayViewProps) {
  const sipacBlue = "#2F6FB3";
  const sipacSoftBlue = "#E8F1FB";
  const [turnos, setTurnos] = useState<AgendaTurno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAgenda = async () => {
      try {
        setLoading(true);
        setError("");
        const turnosData = await getAgendaByDate(selectedDate);
        setTurnos(
          [...turnosData].sort(
            (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
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

  const agendaMetrics = useMemo(
    () => ({
      total: turnos.length,
      confirmados: turnos.filter((turno) => turno.estado === "CONFIRMADO").length,
      pendientes: turnos.filter((turno) => turno.estado === "PENDIENTE").length,
      ausentes: turnos.filter((turno) => turno.estado === "AUSENTE").length,
    }),
    [turnos],
  );

  const toggleEstado = async (turno: AgendaTurno) => {
    const currentIndex = ESTADOS.indexOf(turno.estado);
    const nextEstado = ESTADOS[(currentIndex + 1) % ESTADOS.length];
    const previous = turnos;
    const optimistic = turnos.map((item) =>
      item.id === turno.id ? { ...item, estado: nextEstado } : item,
    );
    setTurnos(optimistic);

    try {
      const updated = await updateTurno(turno.id, {
        pacienteId: turno.pacienteId ?? 0,
        fechaHora: turno.fechaHora,
        notas: turno.notas,
        estado: nextEstado,
      });
      setTurnos((current) => current.map((item) => (item.id === turno.id ? updated : item)));
      onTurnoUpdated?.(updated);
    } catch (updateError) {
      console.error("No se pudo actualizar el turno", updateError);
      setTurnos(previous);
      setError("No se pudo actualizar el turno.");
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
    <>
      <CRow className="g-3 mb-4">
        <CCol md={3} sm={6}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardBody className="py-3">
              <div className="small text-muted">Turnos del día</div>
              <div className="fs-4 fw-bold">{agendaMetrics.total}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3} sm={6}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardBody className="py-3">
              <div className="small text-muted">Confirmados</div>
              <div className="fs-4 fw-bold text-success">{agendaMetrics.confirmados}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3} sm={6}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardBody className="py-3">
              <div className="small text-muted">Pendientes</div>
              <div className="fs-4 fw-bold text-warning">{agendaMetrics.pendientes}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3} sm={6}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardBody className="py-3">
              <div className="small text-muted">Ausentes</div>
              <div className="fs-4 fw-bold text-dark">{agendaMetrics.ausentes}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CCard className="border-0 shadow-sm">
        <CCardBody className="p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
            <div>
              <div className="fw-semibold">Turnos programados</div>
              <div className="small text-muted">
                Hacé click en el estado para ir actualizándolo durante la jornada.
              </div>
            </div>
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 small"
              style={{ backgroundColor: sipacSoftBlue, color: sipacBlue }}
            >
              <BsClock />
              Vista cronológica del día
            </div>
          </div>

          {turnos.length === 0 ? (
            <div className="border rounded-4 p-4 text-center text-muted bg-light-subtle">
              No hay turnos cargados para esta fecha.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {turnos.map((turno) => (
                <div
                  key={turno.id}
                  className="border rounded-4 px-3 py-3 d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <div className="d-flex align-items-start gap-3 flex-grow-1">
                    <div
                      className="rounded-4 px-3 py-2 text-center flex-shrink-0"
                      style={{ backgroundColor: sipacSoftBlue, minWidth: 96 }}
                    >
                      <div className="small text-muted">Hora</div>
                      <div className="fw-bold" style={{ color: sipacBlue }}>
                        {formatHour(turno.fechaHora)}
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2 flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <div className="fw-semibold fs-5">{turno.pacienteNombre}</div>
                        <CBadge color={estadoColor(turno.estado)}>{turno.estado}</CBadge>
                      </div>

                      <div className="small text-muted d-inline-flex align-items-center gap-2">
                        <BsPerson />
                        Paciente asignado al turno del día
                      </div>

                      {turno.notas?.trim() ? (
                        <div
                          className="small rounded-3 px-3 py-2"
                          style={{ backgroundColor: "#F8FAFC", color: "#5B6574" }}
                        >
                          {turno.notas}
                        </div>
                      ) : (
                        <div className="small text-muted">Sin notas rápidas cargadas.</div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex flex-column align-items-start align-items-lg-end gap-2">
                    <div className="small text-muted">Acción rápida</div>
                    <button
                      type="button"
                      className={`badge bg-${estadoColor(turno.estado)} border-0 px-3 py-2`}
                      style={{ cursor: "pointer" }}
                      onClick={() => void toggleEstado(turno)}
                      title="Cambiar estado"
                    >
                      Cambiar a {ESTADOS[(ESTADOS.indexOf(turno.estado) + 1) % ESTADOS.length]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CCardBody>
      </CCard>
    </>
  );
}

