import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  BsCalendar3,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,

} from "react-icons/bs";
//import { GiBrain } from "react-icons/gi";
import { getHistoriaClinicaByPacienteId, getPacienteById, type DiagnosticoDTO, type PacienteResponseDTO, type TipoDiagnostico } from "../../api/pacientes";
import {
  getDiagnosticoFechaFin,
  getDiagnosticoText,

} from "../../components/historia_clinica/diagnosticos/diagnosticoUtils";
import DiagnosticoHeader from "../../components/historia_clinica/diagnosticos/DiagnosticoHeader";
import DiagnosticoFilters from "../../components/historia_clinica/diagnosticos/DiagnosticoFilters";


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
  //const evolucion = getDiagnosticoText(diagnostico);
  const tratamiento = getDiagnosticoText(diagnostico, "tratamiento");
  //const fecha = typeof diagnostico.fecha === "string" ? formatDateTime(diagnostico.fecha) : "";
  const fecha = formatDateTime(diagnostico.fechaInicio);
  const ultimaEvolucion = diagnostico.evoluciones?.[0];

  const evolucion = ultimaEvolucion?.nota?.trim() ?? "";
  //const fechaFinRaw = getDiagnosticoFechaFin(diagnostico);
  //const fechaFin = fechaFinRaw ? formatDateTime(fechaFinRaw) : "";
  const fechaFin = formatDateTime(
    getDiagnosticoFechaFin(diagnostico),
  );
  // const cie10 =
  //   diagnostico.cie10 && typeof diagnostico.cie10 === "object"
  //     ? (diagnostico.cie10 as Record<string, unknown>)
  //     : null;
  const cie10 = diagnostico.cie10;
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
  //const [filter, setFilter] = useState<"all" | "principal" | "active" | "closed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [estadoFilter, setEstadoFilter] = useState<"all" | "active" | "closed">("all");
  const [tipoDiagnosticoFilter, setTipoDiagnosticoFilter] = useState<TipoDiagnostico | "all">("all");

  const tipoDiagnosticoLabels: Record<TipoDiagnostico, string> = {
    PRINCIPAL: "Principal",
    SECUNDARIO: "Secundario",
    FACTOR_PSICOSOCIAL: "Factor psicosocial",
    EVENTO_RIESGO: "Evento de riesgo",
    SINTOMA: "Síntoma",
  };

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


  const tiposDiagnostico = Object.keys(
    tipoDiagnosticoLabels
  ) as TipoDiagnostico[];


  const filteredDiagnosticos = diagnosticos.filter((diagnostico) => {
    const {
      descripcion,
      evolucion,
      tratamiento,
      cie10Label,
      fechaFin,
    } = getDiagnosticoFields(diagnostico);

    const hayMatch =
      !normalizedSearch ||
      descripcion.toLowerCase().includes(normalizedSearch) ||
      evolucion.toLowerCase().includes(normalizedSearch) ||
      tratamiento.toLowerCase().includes(normalizedSearch) ||
      cie10Label.toLowerCase().includes(normalizedSearch);

    if (!hayMatch) {
      return false;
    }

    // ESTADO
    if (estadoFilter === "active" && fechaFin) {
      return false;
    }

    if (estadoFilter === "closed" && !fechaFin) {
      return false;
    }

    // TIPO
    if (
      tipoDiagnosticoFilter !== "all" &&
      diagnostico.tipo !== tipoDiagnosticoFilter
    ) {
      return false;
    }

    return true;
  });



  useEffect(() => {
    setCurrentPage(1);
  }, [search, estadoFilter, tipoDiagnosticoFilter,]);

  const totalPages = Math.max(1, Math.ceil(filteredDiagnosticos.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedDiagnosticos = filteredDiagnosticos.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE,
  );

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

        <DiagnosticoHeader
          pacienteNombre={pacienteNombre}
          onBack={() => navigate(-1)}
        />

        <DiagnosticoFilters
          search={search}
          onSearchChange={setSearch}
          estadoFilter={estadoFilter}
          onEstadoFilterChange={setEstadoFilter}
          tipoDiagnosticoFilter={tipoDiagnosticoFilter}
          onTipoDiagnosticoFilterChange={
            setTipoDiagnosticoFilter
          }
          tiposDiagnostico={tiposDiagnostico}
          tipoDiagnosticoLabels={
            tipoDiagnosticoLabels
          }
        />

        {filteredDiagnosticos.length === 0 ? (
          <CCard className="border-0 shadow-sm">
            <CCardBody className="text-muted">
              No hay diagnósticos que coincidan con los filtros aplicados.
            </CCardBody>
          </CCard>
        ) : (
          <div className="d-flex flex-column gap-3">
            {paginatedDiagnosticos.map((diagnostico, index) => {
              const { descripcion, evolucion, tratamiento, fecha, fechaFin, cie10Label } =
                getDiagnosticoFields(diagnostico);
              const diagnosticoKey = pageStartIndex + index;

              return (
                // <div
                //   key={`diagnostico-${diagnosticoKey}`}
                //   className="sipac-diagnostico-item"
                // >


                //   <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                //     <div className="flex-grow-1 d-flex flex-column gap-2">
                //       <div className="d-flex flex-wrap align-items-center gap-2">

                //         {diagnostico.tipo ? (
                //           <CBadge color="primary">
                //             {tipoDiagnosticoLabels[diagnostico.tipo]}
                //           </CBadge>
                //         ) : null}

                //         <CBadge color={fechaFin ? "secondary" : "success"}>
                //           {fechaFin ? "Finalizado" : "Activo"}
                //         </CBadge>

                //         {cie10Label ? (
                //           <CBadge color="light" textColor="dark">
                //             {cie10Label}
                //           </CBadge>
                //         ) : null}

                //       </div>

                //       {descripcion ? (
                //         <div>
                //           <div className="small text-muted mb-1">Descripción clínica</div>
                //           <div className="fw-semibold" style={{ lineHeight: 1.35 }}>
                //             {descripcion}
                //           </div>
                //         </div>
                //       ) : null}

                //       <CRow className="g-2">
                //         {evolucion ? (
                //           <CCol md={6}>
                //             <div className="border rounded px-3 py-2 h-100 bg-light-subtle">
                //               <div className="small text-muted mb-1">Evolución</div>
                //               <div className="fw-semibold small" style={{ lineHeight: 1.4 }}>
                //                 {evolucion}
                //               </div>
                //             </div>
                //           </CCol>
                //         ) : null}
                //         {tratamiento ? (
                //           <CCol md={6}>
                //             <div className="border rounded px-3 py-2 h-100 bg-light-subtle">
                //               <div className="small text-muted mb-1">Tratamiento</div>
                //               <div className="fw-semibold small" style={{ lineHeight: 1.4 }}>
                //                 {tratamiento}
                //               </div>
                //             </div>
                //           </CCol>
                //         ) : null}
                //       </CRow>
                //     </div>

                //     {(fecha || fechaFin) ? (
                //       <div
                //         className="border rounded px-3 py-2 bg-light-subtle d-flex flex-column gap-2"
                //         style={{ minWidth: 220 }}
                //       >
                //         <div className="d-inline-flex align-items-center gap-2 small text-muted">
                //           <BsCalendar3 />
                //           Línea temporal
                //         </div>
                //         {fecha ? (
                //           <div>
                //             <div className="small text-muted">Fecha de registro</div>
                //             <div className="fw-semibold">{fecha}</div>
                //           </div>
                //         ) : null}
                //         {fechaFin ? (
                //           <div>
                //             <div className="small text-muted">Fecha fin</div>
                //             <div className="fw-semibold">{fechaFin}</div>
                //           </div>
                //         ) : null}
                //       </div>
                //     ) : null}
                //   </div>
                // </div>
                <div
                  key={`diagnostico-${diagnosticoKey}`}
                  className="sipac-diagnostico-item"
                >
                  <div className="d-flex flex-column gap-2">

                    {/* BADGES */}
                    <div className="d-flex flex-wrap align-items-center gap-2">

                      {diagnostico.tipo ? (
                        <span
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: "#EEF4FF",
                            color: "#2F6FB3",
                            border: "1px solid #D7E6FB",
                          }}
                        >
                          {tipoDiagnosticoLabels[diagnostico.tipo]}
                        </span>
                      ) : null}

                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: fechaFin
                            ? "#FAF8F5"
                            : "#F6F8F6",
                          color: fechaFin
                            ? "#9A7B5F"
                            : "#6C8A6D",
                          border: fechaFin
                            ? "1px solid #E8DDD2"
                            : "1px solid #DCE6DC",
                        }}
                      >
                        {fechaFin ? "Finalizado" : "Activo"}
                      </span>

                      {cie10Label ? (
                        <span
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: "#F8F9FA",
                            color: "#495057",
                            border: "1px solid #E9ECEF",
                          }}
                        >
                          {cie10Label}
                        </span>
                      ) : null}
                    </div>

                    {/* DESCRIPCION */}
                    {descripcion ? (
                      <div className="fw-semibold fs-6">
                        {descripcion}
                      </div>
                    ) : null}

                    {/* TRATAMIENTO */}
                    {tratamiento ? (
                      <div className="small text-body-secondary">
                        Tratamiento: {tratamiento}
                      </div>
                    ) : null}

                    {/* EVOLUCION */}
                    {evolucion ? (
                      <div className="small fst-italic text-muted">
                        {evolucion}
                      </div>
                    ) : null}

                    {/* FECHAS */}
                    {(fecha || fechaFin) ? (
                      <div className="d-flex flex-wrap gap-3 small text-body-secondary">

                        {fecha ? (
                          <span>
                            <strong>Inicio:</strong> {fecha}
                          </span>
                        ) : null}

                        {fechaFin ? (
                          <span>
                            <strong>Alta:</strong> {fechaFin}
                          </span>
                        ) : null}

                      </div>
                    ) : null}

                  </div>
                </div>
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
