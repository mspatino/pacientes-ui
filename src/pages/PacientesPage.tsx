import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
  BsFillEyeFill,
  BsListUl,
  BsSliders2,
} from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa";
import { getPacientes } from "../api/pacientes";
import type { Paciente } from "../api/pacientes";
import PacientesFiltersCollapse, {
  type SexoFilter,
} from "../components/PacientesFiltersCollapse";

export default function PacientesPage() {
  type SortField = "apellido" | "nombre" | "fechaAlta";
  type SortOrder = "asc" | "desc";
  const PAGE_SIZE = 10;

  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [diagnosticoTerm, setDiagnosticoTerm] = useState("");
  const [sexoFilter, setSexoFilter] = useState<SexoFilter>("");
  const [sortField, setSortField] = useState<SortField>("apellido");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const sipacBlue = "#2F6FB3";
  const sipacSoftBlue = "#E8F1FB";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getPacientes();
      setPacientes(data);
    } catch (error) {
      console.error("Error cargando pacientes", error);
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedDiagnostico = diagnosticoTerm.trim().toLowerCase();
  const normalizedSexo = sexoFilter.toLowerCase();

  const filteredPacientes = pacientes.filter((p) => {
    const fullName = `${p.apellido} ${p.nombre}`.toLowerCase();
    const dni = (p.dni ?? "").toString().toLowerCase();
    const diagnostico = (p.diagnostico ?? "").toLowerCase();
    const sexo = (p.sexo ?? "").toString().toLowerCase();

    const matchesSearch =
      !normalizedSearch ||
      dni.includes(normalizedSearch) ||
      fullName.includes(normalizedSearch);

    const matchesDiagnostico =
      !normalizedDiagnostico || diagnostico.includes(normalizedDiagnostico);

    const matchesSexo = !sexoFilter || sexo === normalizedSexo;

    return matchesSearch && matchesDiagnostico && matchesSexo;
  });

  const sortedPacientes = [...filteredPacientes].sort((a, b) => {
    if (sortField === "apellido") {
      const valueA = (a.apellido ?? "").toLowerCase();
      const valueB = (b.apellido ?? "").toLowerCase();
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (sortField === "nombre") {
      const valueA = (a.nombre ?? "").toLowerCase();
      const valueB = (b.nombre ?? "").toLowerCase();
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    const dateA = new Date(a.fechaAlta ?? a.fecha_alta ?? "").getTime();
    const dateB = new Date(b.fechaAlta ?? b.fecha_alta ?? "").getTime();
    const safeA = Number.isNaN(dateA) ? 0 : dateA;
    const safeB = Number.isNaN(dateB) ? 0 : dateB;
    return sortOrder === "asc" ? safeA - safeB : safeB - safeA;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortOrder("asc");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, diagnosticoTerm, sexoFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedPacientes.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedPacientes = sortedPacientes.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE,
  );

  const sortIndicator = (field: SortField): string => {
    if (sortField !== field) return "△";
    return sortOrder === "asc" ? "▲" : "▼";
  };

  const formatFechaAlta = (paciente: Paciente): string => {
    const rawFecha = paciente.fechaAlta ?? paciente.fecha_alta;
    if (!rawFecha) return "-";

    const date = new Date(rawFecha);
    if (Number.isNaN(date.getTime())) return rawFecha;

    return new Intl.DateTimeFormat("es-AR").format(date);
  };

  const handlePrintPaciente = (paciente: Paciente) => {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) return;

    const fechaAlta = formatFechaAlta(paciente);
    popup.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Planilla paciente #${paciente.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #1f2937; }
            h1 { margin: 0 0 20px; font-size: 24px; }
            .row { margin-bottom: 10px; }
            .label { font-weight: 700; display: inline-block; min-width: 130px; }
          </style>
        </head>
        <body>
          <h1>Planilla de paciente</h1>
          <div class="row"><span class="label">ID:</span> ${paciente.id}</div>
          <div class="row"><span class="label">Apellido:</span> ${paciente.apellido}</div>
          <div class="row"><span class="label">Nombre:</span> ${paciente.nombre}</div>
          <div class="row"><span class="label">DNI:</span> ${paciente.dni}</div>
          <div class="row"><span class="label">Fecha de alta:</span> ${fechaAlta}</div>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  };

  if (loading) return <p>Cargando pacientes...</p>;

  return (
    <div className="p-3">
      <div className="border rounded bg-white p-3 mb-4">
        <div
          className="d-flex align-items-center gap-2 mb-2"
          role="button"
          tabIndex={0}
          onClick={() => setShowFilters((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowFilters((prev) => !prev);
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <BsSliders2 style={{ color: sipacBlue }} />
          <h1 className="h5 fw-bold mb-0">
            Filtros{" "}
            <span style={{ fontSize: "0.7rem", lineHeight: 1 }}>
              {showFilters ? "▲" : "▼"}
            </span>
          </h1>
        </div>
        <PacientesFiltersCollapse
          showFilters={showFilters}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          diagnosticoTerm={diagnosticoTerm}
          onDiagnosticoTermChange={setDiagnosticoTerm}
          sexoFilter={sexoFilter}
          onSexoFilterChange={setSexoFilter}
        />
      </div>

      <div className="border rounded bg-white p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <BsListUl style={{ color: sipacBlue }} />
          <h1 className="h5 fw-bold mb-0">Pacientes</h1>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
              <th style={{ width: "25%" }}>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span>Apellido</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 text-decoration-none d-inline-flex align-items-center gap-1"
                    onClick={() => toggleSort("apellido")}
                    title="Ordenar por apellido"
                  >
                    {sortIndicator("apellido")}
                  </button>
                </div>
              </th>
              <th style={{ width: "25%" }}>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span>Nombres</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 text-decoration-none"
                    onClick={() => toggleSort("nombre")}
                  >
                    {sortIndicator("nombre")}
                  </button>
                </div>
              </th>
              <th style={{ width: "20%" }}>Documento</th>
              <th style={{ width: "18%", whiteSpace: "nowrap" }}>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span>Fecha de alta</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 text-decoration-none"
                    onClick={() => toggleSort("fechaAlta")}
                  >
                    {sortIndicator("fechaAlta")}
                  </button>
                </div>
              </th>
              <th style={{ width: "12%", whiteSpace: "nowrap" }}>Detalle</th>
              </tr>
            </thead>

            <tbody>
              {paginatedPacientes.length > 0 ? (
                paginatedPacientes.map((p) => (
                  <tr key={p.id}>
                    <td>{p.apellido}</td>
                    <td>{p.nombre}</td>
                    <td>{p.dni}</td>
                    <td className="text-nowrap">{formatFechaAlta(p)}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <span
                          role="button"
                          tabIndex={0}
                          title="Ver detalle del paciente"
                          aria-label="Ver detalle del paciente"
                          className="d-inline-flex align-items-center"
                          style={{ cursor: "pointer", fontSize: "1.1rem", color: "#2F6FB3" }}
                          onClick={() =>
                            navigate(`/pacientes/${p.id}`, { state: { paciente: p } })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              navigate(`/pacientes/${p.id}`, { state: { paciente: p } });
                            }
                          }}
                        >
                          <BsFillEyeFill />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          title="Imprimir planilla en PDF"
                          aria-label="Imprimir planilla en PDF"
                          className="d-inline-flex align-items-center"
                          style={{ cursor: "pointer", fontSize: "1.1rem", color: "#2F6FB3" }}
                          onClick={() => handlePrintPaciente(p)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handlePrintPaciente(p);
                            }
                          }}
                        >
                          <FaFilePdf />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-3">
                    No se encontraron pacientes con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sortedPacientes.length > 0 ? (
        <div className="d-flex justify-content-center mt-3">
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
  );
}
