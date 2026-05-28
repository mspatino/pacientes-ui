import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CRow,
  CSpinner,
} from "@coreui/react";
import {
  BsArrowLeft,
  BsCalendar3,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
  BsSearch,
} from "react-icons/bs";
import { GiBrain } from "react-icons/gi";
import { getHistoriaClinicaByPacienteId, getPacienteById, type DiagnosticoDTO, type PacienteResponseDTO } from "../../api/pacientes";
import {
  getDiagnosticoFechaFin,
  getDiagnosticoText,
  isDiagnosticoActivo,
  isDiagnosticoPrincipal,
} from "../../components/historia_clinica/diagnosticos/diagnosticoUtils";

const formatDateTime = (raw?: string | null): string => {
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getDiagnosticoFields = (diagnostico: DiagnosticoDTO) => {
  const descripcion = getDiagnosticoText(diagnostico, "descripcion");
  const evolucion = getDiagnosticoText(diagnostico);
  const tratamiento = getDiagnosticoText(diagnostico, "tratamiento");
  const fecha = typeof diagnostico.fecha === "string" ? formatDateTime(diagnostico.fecha) : "";
  const fechaFinRaw = getDiagnosticoFechaFin(diagnostico);
  const fechaFin = fechaFinRaw ? formatDateTime(fechaFinRaw) : "";
  const cie10 =
    diagnostico.cie10 && typeof diagnostico.cie10 === "object"
      ? (diagnostico.cie10 as Record<string, unknown>)
      : null;
  const cie10Label = [
    cie10 && typeof cie10.codigo === "string" ? cie10.codigo : "",
    cie10 && typeof cie10.descripcion === "string" ? cie10.descripcion : "",
  ]
    .filter(Boolean)
    .join(" - ");

  return {
    descripcion,
    evolucion,
    tratamiento,
    fecha,
    fechaFin,
    cie10Label,
    principal: isDiagnosticoPrincipal(diagnostico),
  };
};

export default function DiagnosticosPacientePage() {
  const PAGE_SIZE = 5;
  const sipacBlue = "#2F6FB3";
  const sipacSoftBlue = "#E8F1FB";
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pacienteNombre, setPacienteNombre] = useState("Paciente");
  //const [diagnosticos, setDiagnosticos] = useState<Record<string, unknown>[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoDTO[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "principal" | "active" | "closed">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const pacienteId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      if (!pacienteId) {
        setLoading(false);
        setError("ID de paciente inválido.");
        return;
      }

      try {
        const [pacienteData, historiaData] = await Promise.all([
          getPacienteById(pacienteId) as Promise<PacienteResponseDTO>,
          getHistoriaClinicaByPacienteId(pacienteId),
        ]);

        const apellido = (pacienteData.apellido || "").trim();
        const nombre = (pacienteData.nombre || "").trim();
        const fullName = `${apellido} ${nombre}`.trim();
        if (fullName) setPacienteNombre(fullName);

        setDiagnosticos(
          Array.isArray(historiaData.diagnosticos) ? historiaData.diagnosticos : [],
        );
      } catch (loadError) {
        console.error("No se pudieron cargar los diagnósticos", loadError);
        setError("No se pudieron cargar los diagnósticos del paciente.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pacienteId]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredDiagnosticos = diagnosticos.filter((diagnostico) => {
    const { descripcion, evolucion, tratamiento, cie10Label, principal, fechaFin } =
      getDiagnosticoFields(diagnostico);
    const hayMatch =
      !normalizedSearch ||
      descripcion.toLowerCase().includes(normalizedSearch) ||
      evolucion.toLowerCase().includes(normalizedSearch) ||
      tratamiento.toLowerCase().includes(normalizedSearch) ||
      cie10Label.toLowerCase().includes(normalizedSearch);

    if (!hayMatch) return false;
    if (filter === "principal") return principal;
    if (filter === "active") return !fechaFin;
    if (filter === "closed") return Boolean(fechaFin);
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredDiagnosticos.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedDiagnosticos = filteredDiagnosticos.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE,
  );

  const totalDiagnosticos = diagnosticos.length;
  const principales = diagnosticos.filter((item) => isDiagnosticoPrincipal(item)).length;
  const activos = diagnosticos.filter((item) => isDiagnosticoActivo(item)).length;

  if (loading) {
    return (
      <div className="p-3 d-flex align-items-center gap-2 text-muted">
        <CSpinner size="sm" />
        Cargando diagnósticos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <CAlert color="danger" className="mb-0">
          {error}
        </CAlert>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className="small text-muted mb-2">
          Historia clínica / Diagnósticos / Paciente: {pacienteNombre}
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h4 fw-bold mb-1 d-flex align-items-center gap-2">
              <GiBrain />
              Diagnósticos
            </h1>
            <div className="small text-muted">
              Paciente: <span className="fw-semibold text-body">{pacienteNombre}</span>
            </div>
          </div>

          <CButton color="secondary" variant="outline" onClick={() => navigate(-1)}>
            <BsArrowLeft className="me-2" />
            Volver
          </CButton>
        </div>

        <CRow className="g-3 mb-4">
          <CCol md={4}>
            <CCard className="border-0 shadow-sm h-100">
              <CCardBody>
                <div className="small text-muted">Total</div>
                <div className="fs-4 fw-bold">{totalDiagnosticos}</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="border-0 shadow-sm h-100">
              <CCardBody>
                <div className="small text-muted">Principales</div>
                <div className="fs-4 fw-bold">{principales}</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="border-0 shadow-sm h-100">
              <CCardBody>
                <div className="small text-muted">Activos</div>
                <div className="fs-4 fw-bold">{activos}</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        <CCard className="border-0 shadow-sm mb-4">
          <CCardBody>
            <div className="d-flex flex-column flex-lg-row gap-3 align-items-stretch align-items-lg-center">
              <div className="flex-grow-1 position-relative">
                <BsSearch
                  className="position-absolute text-muted"
                  style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}
                />
                <CFormInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por descripción, CIE-10, evolución o tratamiento"
                  style={{ paddingLeft: 36 }}
                />
              </div>
              <div className="d-flex flex-wrap gap-2">
                <CButton
                  color={filter === "all" ? "primary" : "secondary"}
                  variant={filter === "all" ? undefined : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  Todos
                </CButton>
                <CButton
                  color={filter === "principal" ? "primary" : "secondary"}
                  variant={filter === "principal" ? undefined : "outline"}
                  size="sm"
                  onClick={() => setFilter("principal")}
                >
                  Principal
                </CButton>
                <CButton
                  color={filter === "active" ? "primary" : "secondary"}
                  variant={filter === "active" ? undefined : "outline"}
                  size="sm"
                  onClick={() => setFilter("active")}
                >
                  Activos
                </CButton>
                <CButton
                  color={filter === "closed" ? "primary" : "secondary"}
                  variant={filter === "closed" ? undefined : "outline"}
                  size="sm"
                  onClick={() => setFilter("closed")}
                >
                  Finalizados
                </CButton>
              </div>
            </div>
          </CCardBody>
        </CCard>

        {filteredDiagnosticos.length === 0 ? (
          <CCard className="border-0 shadow-sm">
            <CCardBody className="text-muted">
              No hay diagnósticos que coincidan con los filtros aplicados.
            </CCardBody>
          </CCard>
        ) : (
          <div className="d-flex flex-column gap-3">
            {paginatedDiagnosticos.map((diagnostico, index) => {
              const { descripcion, evolucion, tratamiento, fecha, fechaFin, cie10Label, principal } =
                getDiagnosticoFields(diagnostico);
              const diagnosticoKey = pageStartIndex + index;

              return (
                <CCard key={`diagnostico-${diagnosticoKey}`} className="border-0 shadow-sm">
                  <CCardBody className="p-3">
                    <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                      <div className="flex-grow-1 d-flex flex-column gap-2">
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          {principal ? <CBadge color="primary">Principal</CBadge> : null}
                          <CBadge color={fechaFin ? "secondary" : "success"}>
                            {fechaFin ? "Finalizado" : "Activo"}
                          </CBadge>
                          {cie10Label ? <CBadge color="light" textColor="dark">{cie10Label}</CBadge> : null}
                        </div>

                        {descripcion ? (
                          <div>
                            <div className="small text-muted mb-1">Descripción clínica</div>
                            <div className="fw-semibold" style={{ lineHeight: 1.35 }}>
                              {descripcion}
                            </div>
                          </div>
                        ) : null}

                        <CRow className="g-2">
                          {evolucion ? (
                            <CCol md={6}>
                              <div className="border rounded px-3 py-2 h-100 bg-light-subtle">
                                <div className="small text-muted mb-1">Evolución</div>
                                <div className="fw-semibold small" style={{ lineHeight: 1.4 }}>
                                  {evolucion}
                                </div>
                              </div>
                            </CCol>
                          ) : null}
                          {tratamiento ? (
                            <CCol md={6}>
                              <div className="border rounded px-3 py-2 h-100 bg-light-subtle">
                                <div className="small text-muted mb-1">Tratamiento</div>
                                <div className="fw-semibold small" style={{ lineHeight: 1.4 }}>
                                  {tratamiento}
                                </div>
                              </div>
                            </CCol>
                          ) : null}
                        </CRow>
                      </div>

                      {(fecha || fechaFin) ? (
                        <div
                          className="border rounded px-3 py-2 bg-light-subtle d-flex flex-column gap-2"
                          style={{ minWidth: 220 }}
                        >
                          <div className="d-inline-flex align-items-center gap-2 small text-muted">
                            <BsCalendar3 />
                            Línea temporal
                          </div>
                          {fecha ? (
                            <div>
                              <div className="small text-muted">Fecha de registro</div>
                              <div className="fw-semibold">{fecha}</div>
                            </div>
                          ) : null}
                          {fechaFin ? (
                            <div>
                              <div className="small text-muted">Fecha fin</div>
                              <div className="fw-semibold">{fechaFin}</div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </CCardBody>
                </CCard>
              );
            })}

            {totalPages > 1 ? (
              <div className="d-flex justify-content-center mt-2">
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm border-0"
                    style={{ color: sipacBlue, backgroundColor: sipacSoftBlue }}
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    aria-label="Primera página"
                    title="Primera página"
                  >
                    <BsChevronDoubleLeft />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm border-0"
                    style={{ color: sipacBlue, backgroundColor: sipacSoftBlue }}
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    aria-label="Página anterior"
                    title="Página anterior"
                  >
                    <BsChevronLeft />
                  </button>
                  <span className="small text-muted px-2">
                    {safeCurrentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm border-0"
                    style={{ color: sipacBlue, backgroundColor: sipacSoftBlue }}
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    aria-label="Página siguiente"
                    title="Página siguiente"
                  >
                    <BsChevronRight />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm border-0"
                    style={{ color: sipacBlue, backgroundColor: sipacSoftBlue }}
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    aria-label="Última página"
                    title="Última página"
                  >
                    <BsChevronDoubleRight />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
