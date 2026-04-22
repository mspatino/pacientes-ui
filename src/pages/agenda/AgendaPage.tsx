import { useMemo, useState } from "react";
import {
  CButton,
  CButtonGroup,
  CCol,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from "@coreui/react";
import { BsCalendar3, BsChevronLeft, BsChevronRight, BsPlusLg, BsSearch, BsXLg } from "react-icons/bs";
import { createTurno } from "../../api/agenda";
import { getPacientes, type Paciente } from "../../api/pacientes";
import AgendaDiaPage from "./AgendaDiaPage";
import AgendaSemanaPage from "./AgendaSemanaPage";
import AgendaMesPage from "./AgendaMesPage";
import type { AgendaNuevoTurnoForm, AgendaViewMode } from "./agenda.types";
import {
  buildTurnoDateTime,
  formatDateInput,
  formatDateLabel,
  formatMonthTitle,
  shiftDateByDays,
  shiftDateByMonths,
} from "./agenda.utils";

const initialNuevoTurno: AgendaNuevoTurnoForm = {
  pacienteId: 0,
  pacienteNombre: "",
  telefonoContacto: "",
  hora: "",
  notas: "",
};

const QUICK_HOURS = Array.from({ length: 13 }, (_, index) => {
  const hour = index + 8;
  return `${String(hour).padStart(2, "0")}:00`;
});

export default function AgendaPage() {
  const sipacBlue = "#2F6FB3";
  const [viewMode, setViewMode] = useState<AgendaViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()));
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteQuery, setPacienteQuery] = useState("");
  const [showPacienteSuggestions, setShowPacienteSuggestions] = useState(false);
  const [nuevo, setNuevo] = useState<AgendaNuevoTurnoForm>(initialNuevoTurno);

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

  const pageLabel =
    viewMode === "day"
      ? formatDateLabel(selectedDate)
      : viewMode === "week"
        ? `Semana de ${formatDateLabel(selectedDate)}`
        : formatMonthTitle(selectedDate);

  const openCreateModal = async () => {
    if (pacientes.length === 0) {
      try {
        const data = await getPacientes();
        setPacientes(data);
      } catch (error) {
        console.error("No se pudieron cargar pacientes para agenda", error);
      }
    }
    setModalVisible(true);
  };

  const handleShift = (direction: -1 | 1) => {
    if (viewMode === "month") {
      setSelectedDate((prev) => shiftDateByMonths(prev, direction));
      return;
    }

    if (viewMode === "week") {
      setSelectedDate((prev) => shiftDateByDays(prev, 7 * direction));
      return;
    }

    setSelectedDate((prev) => shiftDateByDays(prev, direction));
  };

  const agregarTurno = async () => {
    const hasRegisteredPaciente = Boolean(nuevo.pacienteId);
    const hasManualPaciente = Boolean(nuevo.pacienteNombre.trim());
    if ((!hasRegisteredPaciente && !hasManualPaciente) || !nuevo.hora) return;

    setSaving(true);
    try {
      await createTurno({
        pacienteId: nuevo.pacienteId || undefined,
        pacienteNombre: nuevo.pacienteNombre.trim() || undefined,
        telefonoContacto: nuevo.telefonoContacto.trim() || undefined,
        fechaHora: buildTurnoDateTime(selectedDate, nuevo.hora),
        estado: "PENDIENTE",
        notas: nuevo.notas.trim() || undefined,
      });

      setNuevo(initialNuevoTurno);
      setPacienteQuery("");
      setShowPacienteSuggestions(false);
      setModalVisible(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("No se pudo guardar el turno", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3">
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div
          className="border rounded-4 p-4 mb-4"
          style={{
            background: "linear-gradient(135deg, #F7FBFF 0%, #EEF5FD 55%, #E4EEF9 100%)",
            borderColor: "#D5E5F6",
          }}
        >
          <div className="d-flex flex-column gap-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
               <div className="d-flex flex-column gap-2">
                {/* <div
                  className="d-inline-flex align-items-center gap-2 small fw-semibold px-3 py-2 rounded-pill"
                  style={{ backgroundColor: "#FFFFFFB8", color: sipacBlue }}
                >
                   <BsClipboard2Pulse />
                  Agenda  
                </div> */}
                <div>
               <h3 className="h3 fw-grey mb-1 d-flex align-items-center gap-2">
                    <BsCalendar3 color={sipacBlue} />
                    Agenda
                  </h3>
                     
                  {/* <div className="text-muted">
                    Organizá turnos en vista diaria, semanal o mensual desde una sola pantalla.
                  </div>  */}
                </div>
              </div> 

              <CButtonGroup>
                <CButton
                  color={viewMode === "day" ? "primary" : "secondary"}
                  variant={viewMode === "day" ? undefined : "outline"}
                  onClick={() => setViewMode("day")}
                >
                  Día
                </CButton>
                <CButton
                  color={viewMode === "week" ? "primary" : "secondary"}
                  variant={viewMode === "week" ? undefined : "outline"}
                  onClick={() => setViewMode("week")}
                >
                  Semana
                </CButton>
                <CButton
                  color={viewMode === "month" ? "primary" : "secondary"}
                  variant={viewMode === "month" ? undefined : "outline"}
                  onClick={() => setViewMode("month")}
                >
                  Mes
                </CButton>
              </CButtonGroup>
            </div>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap">
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShift(-1)}
                  style={{ width: 42, height: 42, borderRadius: 12 }}
                >
                  <BsChevronLeft size={18} />
                </CButton>

                <div
                  className="small text-muted d-flex align-items-center justify-content-center gap-3 fw-semibold text-capitalize"
                  style={{ minWidth: 280, fontSize: "0.95rem", whiteSpace: "nowrap" }}
                >
                  <BsCalendar3 size={20} />
                  {pageLabel}
                </div>

                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShift(1)}
                  style={{ width: 42, height: 42, borderRadius: 12 }}
                >
                  <BsChevronRight size={18} />
                </CButton>
              </div>

              <div className="d-flex flex-wrap gap-2 align-items-center">
                <CFormInput
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  size="sm"
                  style={{ maxWidth: 180 }}
                />
                <CButton size="sm" onClick={() => void openCreateModal()}>
                  <BsPlusLg className="me-2" />
                  Agregar turno
                </CButton>
              </div>
            </div>
          </div>
        </div>

        {viewMode === "day" ? (
          <AgendaDiaPage selectedDate={selectedDate} refreshKey={refreshKey} />
        ) : null}
        {viewMode === "week" ? (
          <AgendaSemanaPage selectedDate={selectedDate} refreshKey={refreshKey} />
        ) : null}
        {viewMode === "month" ? (
          <AgendaMesPage selectedDate={selectedDate} refreshKey={refreshKey} />
        ) : null}
      </div>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Nuevo turno</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
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

              {nuevo.pacienteId ? (
                <div className="mt-2 d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-light-subtle">
                  <span className="small">
                    Paciente seleccionado:{" "}
                    <span className="fw-semibold text-body">{nuevo.pacienteNombre}</span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm border-0 p-0 d-inline-flex align-items-center"
                    onClick={() => {
                      setNuevo((prev) => ({ ...prev, pacienteId: 0, pacienteNombre: "", telefonoContacto: "" }));
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

            {!nuevo.pacienteId ? (
              <>
                <CCol md={12}>
                  <CFormLabel>Paciente no registrado</CFormLabel>
                  <CFormInput
                    value={nuevo.pacienteNombre}
                    placeholder="Nombre y apellido"
                    onChange={(e) =>
                      setNuevo((prev) => ({ ...prev, pacienteNombre: e.target.value }))
                    }
                  />
                </CCol>

                <CCol md={12}>
                  <CFormLabel>Teléfono de contacto</CFormLabel>
                  <CFormInput
                    value={nuevo.telefonoContacto}
                    placeholder="Ej: 11 5555 5555"
                    onChange={(e) =>
                      setNuevo((prev) => ({ ...prev, telefonoContacto: e.target.value }))
                    }
                  />
                </CCol>
              </>
            ) : null}

            <CCol md={12}>
              <CFormLabel>Hora</CFormLabel>
              <CFormInput
                type="time"
                value={nuevo.hora}
                step={3600}
                onChange={(e) => setNuevo((prev) => ({ ...prev, hora: e.target.value }))}
              />
              <div className="d-flex flex-wrap gap-2 mt-2">
                {QUICK_HOURS.map((hour) => (
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
              <div className="small text-muted mt-2">
                Se proponen turnos por hora. Si necesitás, podés ajustar los minutos manualmente.
              </div>
            </CCol>

            <CCol md={12}>
              <CFormLabel>Notas rápidas</CFormLabel>
              <CFormTextarea
                rows={2}
                value={nuevo.notas}
                onChange={(e) => setNuevo((prev) => ({ ...prev, notas: e.target.value }))}
                placeholder="Agregar una nota breve para el turno"
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton
            onClick={() => void agregarTurno()}
            disabled={
              (!nuevo.pacienteId && !nuevo.pacienteNombre.trim()) || !nuevo.hora || saving
            }
          >
            {saving ? "Guardando..." : "Guardar"}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
