import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner,
} from "@coreui/react";
import { BsArrowLeft, BsCalendar3, BsCheckCircle, BsSearch, BsXLg } from "react-icons/bs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createTurno, getAgendaByDate, getTurnoById, updateTurno, type AgendaTurno } from "../../api/agenda";
import { getPacientes, type Paciente } from "../../api/pacientes";
import type { AgendaViewMode } from "./agenda.types";
import { buildTurnoDateTime, formatDateInput, formatDateLabel } from "./agenda.utils";

interface NuevoTurnoForm {
  pacienteId: number;
  pacienteNombre: string;
  nombreContacto: string;
  telefonoContacto: string;
  fecha: string;
  hora: string;
  notas: string;
}

const QUICK_HOURS = Array.from({ length: 13 }, (_, index) => {
  const hour = index + 8;
  return `${String(hour).padStart(2, "0")}:00`;
});
const DEFAULT_TURNO_DURATION = 60;

const initialNuevoTurno = (fecha: string): NuevoTurnoForm => ({
  pacienteId: 0,
  pacienteNombre: "",
  nombreContacto: "",
  telefonoContacto: "",
  fecha,
  hora: "",
  notas: "",
});

export default function NuevoTurnoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("fecha") || formatDateInput(new Date());
  const viewMode = searchParams.get("view");
  const turnoIdParam = searchParams.get("turnoId");
  const turnoId = turnoIdParam ? Number(turnoIdParam) : null;
  const agendaView: AgendaViewMode =
    viewMode === "week" || viewMode === "month" ? viewMode : "day";

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingTurno, setLoadingTurno] = useState(Boolean(turnoId));
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pacienteQuery, setPacienteQuery] = useState("");
  const [showPacienteSuggestions, setShowPacienteSuggestions] = useState(false);
  const [dayTurnos, setDayTurnos] = useState<AgendaTurno[]>([]);
  const [nuevo, setNuevo] = useState<NuevoTurnoForm>(() => initialNuevoTurno(selectedDate));

  useEffect(() => {
    setNuevo((prev) => ({ ...prev, fecha: selectedDate }));
  }, [selectedDate]);

  useEffect(() => {
    const loadPacientes = async () => {
      try {
        setLoadingPacientes(true);
        const data = await getPacientes();
        setPacientes(data);
      } catch (loadError) {
        console.error("No se pudieron cargar pacientes para agenda", loadError);
        setError("No se pudieron cargar los pacientes.");
      } finally {
        setLoadingPacientes(false);
      }
    };

    void loadPacientes();
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoadingAvailability(true);
        const turnos = await getAgendaByDate(nuevo.fecha);
        setDayTurnos(turnos);
      } catch (loadError) {
        console.error("No se pudieron cargar horarios disponibles", loadError);
        setError("No se pudieron cargar los horarios disponibles.");
        setDayTurnos([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    void loadAvailability();
  }, [nuevo.fecha]);

  useEffect(() => {
    if (!turnoId) {
      setLoadingTurno(false);
      return;
    }

    const loadTurno = async () => {
      try {
        setLoadingTurno(true);
        const turno = await getTurnoById(turnoId);
        const fechaHora = turno.fechaHora || "";
        const [fecha = selectedDate, timePart = ""] = fechaHora.split("T");
        const hora = timePart.slice(0, 5);

        setNuevo((prev) => ({
          ...prev,
          pacienteId: turno.pacienteId ? Number(turno.pacienteId) : 0,
          pacienteNombre: turno.pacienteId ? turno.pacienteNombre : "",
          nombreContacto: turno.pacienteId ? "" : (turno.nombreContacto || turno.pacienteNombre || ""),
          telefonoContacto: turno.telefonoContacto || "",
          fecha,
          hora,
          notas: turno.notas || "",
        }));
        setPacienteQuery(turno.pacienteId ? turno.pacienteNombre : "");
      } catch (loadError) {
        console.error("No se pudo cargar el turno", loadError);
        setError("No se pudo cargar el turno para editar.");
      } finally {
        setLoadingTurno(false);
      }
    };

    void loadTurno();
  }, [selectedDate, turnoId]);

  const filteredPacientes = useMemo(() => {
    const normalized = pacienteQuery.trim().toLowerCase();
    if (normalized.length < 2) return [];

    return pacientes
      .filter((paciente) => {
        const nombreCompleto = `${paciente.apellido || ""} ${paciente.nombre || ""}`.toLowerCase();
        const dni = (paciente.dni || "").toString().toLowerCase();
        return nombreCompleto.includes(normalized) || dni.includes(normalized);
      })
      .slice(0, 8);
  }, [pacienteQuery, pacientes]);

  const availableHours = useMemo(() => {
    const selectedStartForEdit =
      turnoId && nuevo.hora ? new Date(buildTurnoDateTime(nuevo.fecha, nuevo.hora)).getTime() : null;

    return QUICK_HOURS.filter((hour) => {
      const slotStart = new Date(buildTurnoDateTime(nuevo.fecha, hour)).getTime();
      const slotEnd = slotStart + DEFAULT_TURNO_DURATION * 60 * 1000;

      const hasOverlap = dayTurnos
        .filter((turno) => turno.estado !== "CANCELADO")
        .filter((turno) => !(turnoId && turno.id === turnoId))
        .some((turno) => {
          const turnoStart = new Date(turno.fechaHora).getTime();
          const turnoDuration = (turno.duracionMinutos ?? DEFAULT_TURNO_DURATION) * 60 * 1000;
          const turnoEnd = turnoStart + turnoDuration;
          return slotStart < turnoEnd && slotEnd > turnoStart;
        });

      if (!hasOverlap) {
        return true;
      }

      return selectedStartForEdit === slotStart;
    });
  }, [dayTurnos, nuevo.fecha, nuevo.hora, turnoId]);

  useEffect(() => {
    if (loadingAvailability) {
      return;
    }

    if (!nuevo.hora) {
      return;
    }

    if (!availableHours.includes(nuevo.hora)) {
      setNuevo((prev) => ({ ...prev, hora: availableHours[0] ?? "" }));
    }
  }, [availableHours, loadingAvailability, nuevo.hora]);

  const volverAgenda = () => {
    navigate(`/agenda?fecha=${encodeURIComponent(nuevo.fecha)}&view=${agendaView}`, {
      state: { refreshAt: Date.now() },
    });
  };

  const agregarTurno = async () => {
    const hasRegisteredPaciente = Boolean(nuevo.pacienteId);
    const hasManualContact = Boolean(nuevo.nombreContacto.trim());
    if ((!hasRegisteredPaciente && !hasManualContact) || !nuevo.hora) {
      setError("Completá un paciente registrado o un nombre de contacto, y la hora del turno.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        pacienteId: nuevo.pacienteId || undefined,
        nombreContacto: !nuevo.pacienteId ? nuevo.nombreContacto.trim() || undefined : undefined,
        telefonoContacto: nuevo.telefonoContacto.trim() || undefined,
        fechaHoraInicio: buildTurnoDateTime(nuevo.fecha, nuevo.hora),
        estado: "PENDIENTE" as const,
        duracionMinutos: DEFAULT_TURNO_DURATION,
        notas: nuevo.notas.trim() || undefined,
      };

      if (turnoId) {
        await updateTurno(turnoId, payload);
      } else {
        await createTurno(payload);
      }

      setSuccessMessage(turnoId ? "Turno actualizado correctamente." : "Turno agregado correctamente.");
      window.setTimeout(() => {
        volverAgenda();
      }, 500);
    } catch (saveError) {
      console.error("No se pudo guardar el turno", saveError);
      if (axios.isAxiosError(saveError)) {
        const backendMessage =
          typeof saveError.response?.data === "string"
            ? saveError.response.data
            : typeof saveError.response?.data?.message === "string"
              ? saveError.response.data.message
              : "";

        setError(
          backendMessage ||
            "No se pudo guardar el turno.",
        );
        return;
      }

      setError("No se pudo guardar el turno.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3">
      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <div className="small text-muted mb-1">Agenda</div>
            <h3 className="h3 mb-1 d-flex align-items-center gap-2">
              <BsCalendar3 color="#2F6FB3" />
              {turnoId ? "Editar turno" : "Nuevo turno"}
            </h3>
            <div className="text-muted">
              {turnoId ? "Editá el turno" : "Creá el turno"} y volvemos a la agenda del {formatDateLabel(nuevo.fecha)}.
            </div>
          </div>

          <CButton color="secondary" variant="outline" onClick={volverAgenda}>
            <BsArrowLeft className="me-2" />
            Volver a agenda
          </CButton>
        </div>

        <CCard className="border-0 shadow-sm">
          <CCardBody className="p-4">
            {loadingTurno ? (
              <div className="d-flex align-items-center gap-2 text-muted mb-3">
                <CSpinner size="sm" />
                Cargando turno...
              </div>
            ) : null}
            {error ? <CAlert color="danger">{error}</CAlert> : null}
            {successMessage ? (
              <CAlert color="success" className="d-flex align-items-center gap-2">
                <BsCheckCircle />
                {successMessage}
              </CAlert>
            ) : null}

            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel>Fecha</CFormLabel>
                <CFormInput
                  type="date"
                  value={nuevo.fecha}
                  onChange={(e) => setNuevo((prev) => ({ ...prev, fecha: e.target.value }))}
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>Hora</CFormLabel>
                <CFormSelect
                  value={nuevo.hora}
                  disabled={loadingAvailability || availableHours.length === 0}
                  onChange={(e) => setNuevo((prev) => ({ ...prev, hora: e.target.value }))}
                  options={[
                    {
                      label: loadingAvailability
                        ? "Cargando horarios disponibles..."
                        : availableHours.length === 0
                          ? "Sin horarios disponibles"
                          : "Seleccionar horario",
                      value: "",
                      disabled: true,
                    },
                    ...availableHours.map((hour) => ({
                      label: hour,
                      value: hour,
                    })),
                  ]}
                />
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {availableHours.map((hour) => (
                    <CButton
                      key={hour}
                      type="button"
                      size="sm"
                      color={nuevo.hora === hour ? "primary" : "secondary"}
                      variant={nuevo.hora === hour ? undefined : "outline"}
                      onClick={() => setNuevo((prev) => ({ ...prev, hora: hour }))}
                    >
                      {hour}
                    </CButton>
                  ))}
                </div>
                {loadingAvailability ? (
                  <div className="d-flex align-items-center gap-2 text-muted mt-2">
                    <CSpinner size="sm" />
                    Revisando disponibilidad...
                  </div>
                ) : null}
                {!loadingAvailability && availableHours.length === 0 ? (
                  <div className="small text-danger mt-2">
                    No hay horarios disponibles para esta fecha.
                  </div>
                ) : null}
              </CCol>

              <CCol md={12}>
                <CFormLabel>Paciente</CFormLabel>
                <div className="position-relative">
                  <BsSearch
                    className="position-absolute text-muted"
                    style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <CFormInput
                    value={pacienteQuery}
                    placeholder="Buscar por apellido, nombre o DNI"
                    style={{ paddingLeft: 36 }}
                    disabled={loadingPacientes}
                    onFocus={() => {
                      if (pacienteQuery.trim().length >= 2 && filteredPacientes.length > 0) {
                        setShowPacienteSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setShowPacienteSuggestions(false);
                      }, 120);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowPacienteSuggestions(false);
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      const normalized = value.trim().toLowerCase();
                      const hasMatches =
                        normalized.length >= 2 &&
                        pacientes.some((paciente) => {
                          const nombreCompleto =
                            `${paciente.apellido || ""} ${paciente.nombre || ""}`.toLowerCase();
                          const dni = (paciente.dni || "").toString().toLowerCase();
                          return nombreCompleto.includes(normalized) || dni.includes(normalized);
                        });
                      setPacienteQuery(value);
                      setShowPacienteSuggestions(hasMatches);
                      setNuevo((prev) => ({ ...prev, pacienteId: 0 }));
                    }}
                  />
                </div>

                {loadingPacientes ? (
                  <div className="d-flex align-items-center gap-2 text-muted mt-2">
                    <CSpinner size="sm" />
                    Cargando pacientes...
                  </div>
                ) : null}

                {nuevo.pacienteId ? (
                  <div className="mt-2 d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-light-subtle">
                    <span className="small">
                      Paciente seleccionado: <span className="fw-semibold text-body">{nuevo.pacienteNombre}</span>
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm border-0 p-0 d-inline-flex align-items-center"
                      onClick={() => {
                        setNuevo((prev) => ({
                          ...prev,
                          pacienteId: 0,
                          pacienteNombre: "",
                          telefonoContacto: "",
                        }));
                        setPacienteQuery("");
                        setShowPacienteSuggestions(true);
                      }}
                      title="Quitar paciente"
                      aria-label="Quitar paciente"
                    >
                      <BsXLg />
                    </button>
                  </div>
                ) : null}

                {showPacienteSuggestions && !nuevo.pacienteId && filteredPacientes.length > 0 ? (
                  <CListGroup className="mt-2 rounded-3 overflow-hidden">
                    {filteredPacientes.map((paciente) => (
                      <CListGroupItem
                        key={paciente.id}
                        role="button"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const nombre = `${paciente.apellido || ""} ${paciente.nombre || ""}`.trim();
                          setNuevo((prev) => ({
                            ...prev,
                            pacienteId: paciente.id,
                            pacienteNombre: nombre,
                            nombreContacto: "",
                            telefonoContacto: paciente.telefono || "",
                          }));
                          setPacienteQuery(nombre);
                          setShowPacienteSuggestions(false);
                        }}
                      >
                        <div className="fw-semibold">{`${paciente.apellido || ""} ${paciente.nombre || ""}`.trim()}</div>
                        <div className="small text-muted">DNI: {paciente.dni || "-"}</div>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                ) : null}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Nombre de contacto</CFormLabel>
                <CFormInput
                  value={nuevo.nombreContacto}
                  placeholder="Ej: Luis Suarez"
                  disabled={Boolean(nuevo.pacienteId)}
                  onChange={(e) => setNuevo((prev) => ({ ...prev, nombreContacto: e.target.value }))}
                />
                <div className="small text-muted mt-1">
                  Si no seleccionás un paciente registrado, cargá acá el nombre del contacto.
                </div>
              </CCol>

              <CCol md={6}>
                <CFormLabel>Teléfono de contacto</CFormLabel>
                <CFormInput
                  value={nuevo.telefonoContacto}
                  placeholder="Ej: 11 5555 5555"
                  onChange={(e) => setNuevo((prev) => ({ ...prev, telefonoContacto: e.target.value }))}
                />
              </CCol>

              <CCol md={12}>
                <CFormLabel>Notas rápidas</CFormLabel>
                <CFormTextarea
                  rows={3}
                  value={nuevo.notas}
                  onChange={(e) => setNuevo((prev) => ({ ...prev, notas: e.target.value }))}
                  placeholder="Agregar una nota breve para el turno"
                />
              </CCol>

              <CCol md={12} className="d-flex justify-content-end gap-2 pt-2">
                <CButton color="secondary" variant="outline" onClick={volverAgenda}>
                  Cancelar
                </CButton>
                <CButton
                  onClick={() => void agregarTurno()}
                  disabled={loadingTurno || (!nuevo.pacienteId && !nuevo.nombreContacto.trim()) || !nuevo.hora || saving}
                >
                  {saving ? "Guardando..." : turnoId ? "Actualizar turno" : "Guardar turno"}
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </div>
    </div>
  );
}
