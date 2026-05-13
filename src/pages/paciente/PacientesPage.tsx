import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsFillPersonPlusFill,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
  BsFillEyeFill,
  BsListUl,
  BsSliders2,
  BsClipboard2Pulse,
} from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

import { getPacienteById, getPacientes } from "../../api/pacientes";
import type { Paciente, PacienteResponseDTO } from "../../api/pacientes";
import PacientesFiltersCollapse, {
  type SexoFilter,
} from "../../components/PacientesFiltersCollapse";

import { formatEstadoCivil, formatDate , formatConviviente , formatNivelEducativo , asRecord , firstString , firstStringArray  } from "../../utils/pacienteFormatters";
import { CSpinner } from "@coreui/react";

pdfMake.addVirtualFileSystem(pdfFonts);

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

    const dateFormatter = new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const trimmed = rawFecha.trim();
    const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/);

    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]);
      const day = Number(dateOnlyMatch[3]);
      const safeDate = new Date(year, month - 1, day);
      return dateFormatter.format(safeDate);
    }

    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) return rawFecha;

    return dateFormatter.format(date);
  };

  const handleDownloadListaPdf = () => {
    const headerMargin: [number, number, number, number] = [0, 0, 0, 10];
    const footerMargin: [number, number, number, number] = [0, 10, 0, 0];

    const tableBody = [
      ["Apellido", "Nombre", "Documento", "Fecha de alta"],
      ...paginatedPacientes.map((p) => [
        p.apellido || "",
        p.nombre || "",
        p.dni?.toString() || "",
        formatFechaAlta(p),
      ]),
    ];

    const docDefinition = {
      content: [
        { text: "Lista de Pacientes", style: "header" },
        {
          table: {
            widths: ["25%", "25%", "20%", "30%"],
            body: tableBody,
          },
          layout: "lightHorizontalLines",
        },
        {
          text: `Total de pacientes: ${sortedPacientes.length}`,
          style: "footer",
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: headerMargin,
        },
        footer: {
          fontSize: 10,
          italics: true,
          margin: footerMargin,
        },
      },
      defaultStyle: {
        fontSize: 10,
      },
    };

    pdfMake.createPdf(docDefinition).download("lista-pacientes.pdf");
  };

  const handlePrintPaciente = async (paciente: Paciente) => {
    try {
      const detalle: PacienteResponseDTO = await getPacienteById(paciente.id);
      const pacienteData = asRecord(detalle);

      const apellido = firstString(pacienteData, ["apellido"]) || paciente.apellido || "";
      const nombre = firstString(pacienteData, ["nombre", "nombres"]) || paciente.nombre || "";
      const nombreCompleto = `${apellido} ${nombre}`.trim() || `Paciente #${paciente.id}`;

      const identificacionContactoFields: Array<[string, string]> = [
        ["DNI", firstString(pacienteData, ["dni", "documento"]) || paciente.dni?.toString() || "-"],
        [
          "Fecha de nacimiento",
          formatDate(firstString(pacienteData, ["fechaNacimiento", "fecha_nacimiento"])),
        ],
        ["Teléfono", firstString(pacienteData, ["telefono", "teléfono", "celular"]) || "-"],
        ["Email", firstString(pacienteData, ["email", "correo"]) || "-"],
        ["Ocupación", firstString(pacienteData, ["ocupacion", "ocupación"]) || "-"],
        ["Dirección", firstString(pacienteData, ["direccion", "dirección", "domicilio"]) || "-"],
        ["Fecha de alta", formatDate(firstString(pacienteData, ["fechaAlta", "fecha_alta"]))],
      ];

      const estadoConvivenciaFields: Array<[string, string]> = [
        [
          "Estado civil",
          formatEstadoCivil(
            firstString(pacienteData, ["estadoCivil", "estado_civil", "civilStatus"]),
          ),
        ],
        ["Sexo", firstString(pacienteData, ["sexo", "genero", "género"]) || "-"],
        ["Ocupación", firstString(pacienteData, ["ocupacion", "ocupación"]) || "-"],
        [
          "Nivel educativo",
          formatNivelEducativo(firstString(pacienteData, ["nivelEducativo", "nivel_educativo"])),
        ],
        [
          "Convivientes",
          (() => {
            const convivientes = firstStringArray(pacienteData, ["convivientes"]);
            return convivientes.length > 0
              ? convivientes.map(formatConviviente).join(", ")
              : "-";
          })(),
        ],
      ];

      const infoTableLayout = {
        hLineColor: () => "#D6E4F4",
        vLineColor: () => "#D6E4F4",
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 8,
        paddingBottom: () => 8,
      };

      const buildInfoTable = (title: string, fields: Array<[string, string]>) => ({
        stack: [
          { text: title, style: "sectionTitle" },
          {
            table: {
              widths: ["38%", "62%"],
              body: fields.map(([label, value]) => [
                { text: label, style: "fieldLabel" },
                { text: value || "-", style: "fieldValue" },
              ]),
            },
            layout: infoTableLayout,
          },
        ],
      });

      const pacienteHeader: TDocumentDefinitions["content"] extends Array<infer T> ? T : never = {
        table: {
          widths: [52, "*"],
          body: [[
            {
              text: "P",
              alignment: "center",
              color: sipacBlue,
              bold: true,
              fillColor: sipacSoftBlue,
              margin: [0, 10, 0, 10] as [number, number, number, number],
            },
            {
              stack: [
                { text: "Paciente", style: "eyebrow" },
                { text: nombreCompleto, style: "header" },
              ],
              border: [false, false, false, false] as [boolean, boolean, boolean, boolean],
            },
          ]],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 0, 0, 18] as [number, number, number, number],
      } as never;

      const docDefinition: TDocumentDefinitions = {
        pageSize: "A4",
        pageMargins: [32, 36, 32, 36] as [number, number, number, number],
        content: [
          pacienteHeader,
          buildInfoTable("Datos personales", identificacionContactoFields),
          {
            text: "",
            margin: [0, 8, 0, 0] as [number, number, number, number],
          },
          buildInfoTable("Estado personal y convivencia", estadoConvivenciaFields),
        ],
        styles: {
          eyebrow: {
            fontSize: 10,
            color: "#6C7A89",
            margin: [0, 0, 0, 2] as [number, number, number, number],
          },
          header: {
            fontSize: 20,
            bold: true,
            color: "#16324F",
          },
          sectionTitle: {
            fontSize: 12,
            bold: true,
            color: sipacBlue,
            margin: [0, 0, 0, 8] as [number, number, number, number],
          },
          fieldLabel: {
            fontSize: 10,
            color: "#6C7A89",
          },
          fieldValue: {
            fontSize: 11,
            bold: true,
            color: "#1F2D3D",
          },
        },
        defaultStyle: {
          fontSize: 10,
        },
      };

      pdfMake.createPdf(docDefinition).download(`Paciente-${paciente.apellido+", "+paciente.nombre}.pdf`);
    } catch (error) {
      console.error("No se pudo generar el PDF del paciente", error);
    }
  };

  if (loading) return <div className="d-flex align-items-center gap-2 text-muted">
          <CSpinner size="sm" />
          Cargando pacientes...
        </div>;

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

      <div className="border-0 rounded-4 bg-white p-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <BsListUl style={{ color: sipacBlue }} />
            <h1 className="h5 fw-bold mb-0">Pacientes</h1>
          </div>
          <div className="d-flex gap-2">
         
            <button
              type="button"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
              onClick={() => navigate("/pacientes/nuevo")}
            >
              <BsFillPersonPlusFill />
              Nuevo
            </button>
               <button
              type="button"
              className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
              onClick={handleDownloadListaPdf}
            >
              <FaFilePdf />
              Pacientes 
            </button>
          </div>
        </div>

        {/* <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0 paciente-table">
            <thead className="paciente-table-head">
              <tr>
              <th style={{ width: "25%" }}>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span>Apellido</span>
                  <button
                    type="button"
                    className="btn btn-sm p-0 border-0 bg-transparent text-white d-inline-flex align-items-center gap-1"
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
                    className="btn btn-sm p-0 border-0 bg-transparent text-white"
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
                    className="btn btn-sm p-0 border-0 bg-transparent text-white"
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
                          title="Ver historia clínica"
                          aria-label="Ver historia clínica"
                          className="d-inline-flex align-items-center"
                          style={{ cursor: "pointer", fontSize: "1.1rem", color: "#2F6FB3" }}
                          onClick={() => navigate(`/pacientes/${p.id}/historia-clinica`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              navigate(`/pacientes/${p.id}/historia-clinica`);
                            }
                          }}
                        >
                          <BsClipboard2Pulse />
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
        </div> */}
        <div className="table-responsive">
  <table className="table align-middle mb-0 paciente-table">
    <thead className="paciente-table-head">
      <tr>
        <th style={{ width: "25%" }}>
          <div className="d-flex align-items-center justify-content-between gap-2">
            <span>Apellido</span>

            <button
              type="button"
              className="table-sort-btn"
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
              className="table-sort-btn"
              onClick={() => toggleSort("nombre")}
            >
              {sortIndicator("nombre")}
            </button>
          </div>
        </th>

        <th style={{ width: "20%" }}>Documento</th>

        <th style={{ width: "18%", whiteSpace: "nowrap" }}>
          <div className="d-flex align-items-center justify-content-between gap-2">
            <span>Fecha alta</span>

            <button
              type="button"
              className="table-sort-btn"
              onClick={() => toggleSort("fechaAlta")}
            >
              {sortIndicator("fechaAlta")}
            </button>
          </div>
        </th>

        <th
          style={{
            width: "12%",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          Acciones
        </th>
      </tr>
    </thead>

    <tbody>
      {paginatedPacientes.length > 0 ? (
        paginatedPacientes.map((p) => (
          <tr key={p.id}>
            <td>
              <div className="fw-semibold text-dark">{p.apellido}</div>
            </td>

            <td>{p.nombre}</td>

            <td>
              <span className="text-muted">{p.dni}</span>
            </td>

            <td className="text-nowrap text-muted">
              {formatFechaAlta(p)}
            </td>

            <td>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="action-icon-btn"
                  title="Ver detalle"
                  onClick={() =>
                    navigate(`/pacientes/${p.id}`, {
                      state: { paciente: p },
                    })
                  }
                >
                  <BsFillEyeFill />
                </button>

                <button
                  type="button"
                  className="action-icon-btn"
                  title="Historia clínica"
                  onClick={() =>
                    navigate(`/pacientes/${p.id}/historia-clinica`)
                  }
                >
                  <BsClipboard2Pulse />
                </button>

                <button
                  type="button"
                  className="action-icon-btn"
                  title="Exportar PDF"
                  onClick={() => handlePrintPaciente(p)}
                >
                  <FaFilePdf />
                </button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={5} className="text-center text-muted py-5">
            No se encontraron pacientes.
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
