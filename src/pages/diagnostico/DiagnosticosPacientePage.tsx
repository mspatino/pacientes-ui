import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CAlert,
  CCard,
  CCardBody,
  CSpinner,
} from "@coreui/react";
import {
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
  BsClockHistory,
} from "react-icons/bs";
//import { GiBrain } from "react-icons/gi";
import { getHistoriaClinicaByPacienteId, getPacienteById, type DiagnosticoDTO, type PacienteResponseDTO, type TipoDiagnostico } from "../../api/pacientes";
import {
  getDiagnosticoFechaFin,
  getDiagnosticoText,
  formatFechaHora,
} from "../../components/historia_clinica/diagnosticos/diagnosticoUtils";
import DiagnosticoHeader from "../../components/historia_clinica/diagnosticos/DiagnosticoHeader";
import DiagnosticoFilters from "../../components/historia_clinica/diagnosticos/DiagnosticoFilters";







const getDiagnosticoFields = (diagnostico: DiagnosticoDTO) => {
  const descripcion = getDiagnosticoText(diagnostico, "descripcion");

  const tratamiento = getDiagnosticoText(diagnostico, "tratamiento");

  const fecha = formatFechaHora(diagnostico.fechaInicio);




  const fechaFin = formatFechaHora(
    getDiagnosticoFechaFin(diagnostico),
  );

  const cie10 = diagnostico.cie10;
  const cie10Label = [
    cie10 && typeof cie10.codigo === "string" ? cie10.codigo : "",
    cie10 && typeof cie10.descripcion === "string" ? cie10.descripcion : "",
  ]
    .filter(Boolean)
    .join(" - ");

  return {
    descripcion,
    tratamiento,
    fecha,
    fechaFin,
    cie10Label,
    evoluciones: diagnostico.evoluciones ?? [],
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
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoDTO[]>([]);
  const [search, setSearch] = useState("");
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

  const [expandedDiagnosticos, setExpandedDiagnosticos] = useState<
    Record<number, boolean>
  >({});

  const toggleEvoluciones = (diagnosticoId: number) => {
    setExpandedDiagnosticos((prev) => ({
      ...prev,
      [diagnosticoId]: !prev[diagnosticoId],
    }));
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
      tratamiento,
      cie10Label,
      fechaFin,
    } = getDiagnosticoFields(diagnostico);

    const hayMatch =
      !normalizedSearch ||
      descripcion.toLowerCase().includes(normalizedSearch) ||
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
              const { descripcion, tratamiento, fecha, fechaFin, cie10Label } =
                getDiagnosticoFields(diagnostico);
              const diagnosticoKey = pageStartIndex + index;
              const expanded =
                diagnostico.id != null &&
                expandedDiagnosticos[diagnostico.id];

              return (
                <div key={`diagnostico-${diagnosticoKey}`}
                  className="sipac-diagnostico-item sipac-diagnostico-compact">
                  <div className="d-flex flex-column gap-1">

                    <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">

                      {/* TIPO */}
                      {diagnostico.tipo ? (
                        <span
                          className="badge rounded-pill"
                          style={{
                            fontSize: "0.68rem",
                            padding: "0.18rem 0.45rem",
                            backgroundColor: "#EEF4FF",
                            color: "#2F6FB3",
                            border: "1px solid #D7E6FB",
                          }}
                        >
                          {tipoDiagnosticoLabels[diagnostico.tipo]}
                        </span>
                      ) : (
                        <span />
                      )}

                      {/* FECHAS */}
                      <div className="d-flex align-items-center gap-2 flex-wrap small text-body-secondary">

                        {fecha ? (
                          <span>
                            <span
                              className="badge rounded-pill me-1"
                              style={{
                                backgroundColor: "#F6F8F6",
                                color: "#6C8A6D",
                                border: "1px solid #DCE6DC",
                              }}
                            >
                              Inicio
                            </span>
                            {fecha}

                          </span>
                        ) : null}

                        {fechaFin ? (
                          <span>
                            <span
                              className="badge rounded-pill me-1"
                              style={{
                                backgroundColor: "#FAF8F5",
                                color: "#9A7B5F",
                                border: "1px solid #E8DDD2",
                              }}
                            >
                              Alta
                            </span>

                            {fechaFin}
                          </span>
                        ) : null}

                      </div>

                    </div>

                    {/* DESCRIPCION */}
                    {descripcion ? (
                      <div className="fw-semibold"
                        style={{
                          fontSize: "0.92rem",
                          lineHeight: "1.15",
                        }}>
                        {descripcion}
                      </div>
                    ) : null}

                    {cie10Label ? (
                      <div
                        className="small"
                        style={{
                          color: "#6c757d",
                          fontSize: "0.82rem",
                        }}
                      >
                        {cie10Label}
                      </div>
                    ) : null}



                    {/* TRATAMIENTO */}
                    {tratamiento ? (
                      <div className="small text-body-secondary">
                        Tratamiento: {tratamiento}
                      </div>
                    ) : null}

                    {/* EVOLUCION */}
                    {/* {evolucion ? (
                      <div className="small fst-italic text-muted">
                        {evolucion}
                      </div>
                    ) : null} */}
                    {/* {diagnostico.evoluciones?.length ? (
<div className="sipac-seguimiento-mini">

  <div className="sipac-seguimiento-header">
    <span className="sipac-section-icon">
      <BsClockHistory size={12} />
    </span>

    <span className="sipac-seguimiento-title">
      Seguimiento clínico
    </span>
  </div>

  <div className="sipac-seguimiento-list">
    {diagnostico.evoluciones.slice(0, 3).map((evolucion, idx) => (
      <div
        key={evolucion.id ?? idx}
        className="sipac-seguimiento-item"
      >
        <div className="sipac-seguimiento-fecha">
          {formatFechaHora(evolucion.fecha)}
        </div>

        <div className="sipac-seguimiento-nota">
          {evolucion.nota}
        </div>
      </div>
    ))}
  </div>

  {diagnostico.evoluciones.length > 3 && (
    <button
      type="button"
      className="sipac-link-evoluciones"
    >
      Ver todas las evoluciones ({diagnostico.evoluciones.length})
    </button>
  )}

</div>
) : null} */}
                    {diagnostico.evoluciones?.length ? (
                      <div className="sipac-seguimiento-mini">

                        <div className="sipac-seguimiento-header">
                          <span className="sipac-section-icon">
                            <BsClockHistory size={12} />
                          </span>

                          <span className="sipac-seguimiento-title">
                            Seguimiento clínico
                          </span>

                          <button
                            type="button"
                            className="sipac-link-evoluciones"
                            onClick={() =>
                              diagnostico.id &&
                              toggleEvoluciones(diagnostico.id)
                            }
                          >
                            {expanded
                              ? "Ocultar evoluciones"
                              : `Ver evoluciones (${diagnostico.evoluciones.length})`}
                          </button>
                        </div>

                        {!expanded ? (
                          /* SOLO LA ÚLTIMA */
                          <div className="sipac-seguimiento-item">
                            <span className="sipac-seguimiento-fecha">
                              {formatFechaHora(diagnostico.evoluciones[0].fecha)}
                            </span>

                            <span className="sipac-seguimiento-nota">
                              {diagnostico.evoluciones[0].nota}
                            </span>
                          </div>
                        ) : (
                          /* TODAS */
                          diagnostico.evoluciones.map((evolucion, idx) => (
                            <div
                              key={evolucion.id ?? idx}
                              className="sipac-seguimiento-item"
                            >
                              <span className="sipac-seguimiento-fecha">
                                {formatFechaHora(evolucion.fecha)}
                              </span>

                              <span className="sipac-seguimiento-nota">
                                {evolucion.nota}
                              </span>
                            </div>
                          ))
                        )}

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
