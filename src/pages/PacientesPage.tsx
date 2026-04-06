import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPacientes } from "../api/pacientes";
import type { Paciente } from "../api/pacientes";
import { CButton } from "@coreui/react";
import PacientesFiltersCollapse, {
  type SexoFilter,
} from "../components/PacientesFiltersCollapse";

export default function PacientesPage() {
  type SortField = "apellido" | "nombre" | "fechaAlta";
  type SortOrder = "asc" | "desc";

  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [diagnosticoTerm, setDiagnosticoTerm] = useState("");
  const [sexoFilter, setSexoFilter] = useState<SexoFilter>("");
  const [sortField, setSortField] = useState<SortField>("apellido");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

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

  const sortIndicator = (field: SortField): string => {
    if (sortField !== field) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
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
      <h1 className="h4 fw-bold mb-3">Pacientes</h1>

      <PacientesFiltersCollapse
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        diagnosticoTerm={diagnosticoTerm}
        onDiagnosticoTermChange={setDiagnosticoTerm}
        sexoFilter={sexoFilter}
        onSexoFilterChange={setSexoFilter}
      />

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span>Apellido</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 text-decoration-none"
                    onClick={() => toggleSort("apellido")}
                  >
                    {sortIndicator("apellido")}
                  </button>
                </div>
              </th>
              <th>
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
              <th>Documento</th>
              <th>
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
              <th>Detalle</th>
            </tr>
          </thead>

          <tbody>
            {sortedPacientes.length > 0 ? (
              sortedPacientes.map((p) => (
                <tr key={p.id}>
                  <td>{p.apellido}</td>
                  <td>{p.nombre}</td>
                  <td>{p.dni}</td>
                  <td>{formatFechaAlta(p)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <CButton
                        color="info"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/pacientes/${p.id}`, { state: { paciente: p } })
                        }
                      >
                        Ver
                      </CButton>
                      <CButton
                        color="secondary"
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintPaciente(p)}
                      >
                        PDF
                      </CButton>
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
  );
}
