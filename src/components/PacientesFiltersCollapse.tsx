import {
  CCard,
  CCardBody,
  CCollapse,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormInput,
  CFormLabel,
  CRow,
} from "@coreui/react";

export type SexoFilter = "" | "Masculino" | "Femenino" | "Otro";

interface PacientesFiltersCollapseProps {
  showFilters: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  diagnosticoTerm: string;
  onDiagnosticoTermChange: (value: string) => void;
  sexoFilter: SexoFilter;
  onSexoFilterChange: (value: SexoFilter) => void;
}

export default function PacientesFiltersCollapse({
  showFilters,
  searchTerm,
  onSearchTermChange,
  diagnosticoTerm,
  onDiagnosticoTermChange,
  sexoFilter,
  onSexoFilterChange,
}: PacientesFiltersCollapseProps) {
  return (
    <CCollapse visible={showFilters}>
      <CCard className="mb-2">
        <CCardBody className="py-2 px-3">
          <CRow className="g-2 align-items-end">
            <CCol xs={12} md="auto">
              <div className="d-flex flex-column">
                <CFormLabel htmlFor="search-paciente" className="small mb-1">
                  Apellido/ Nombres, DNI
                </CFormLabel>
                <CFormInput
                  id="search-paciente"
                  size="sm"
                  className="py-1"
                  style={{ width: "100%", minWidth: "220px", maxWidth: "280px" }}
                  placeholder="Ej: 30123456 o Perez Juan"
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                />
              </div>
            </CCol>
            <CCol xs={12} md="auto">
              <div className="d-flex flex-column">
                <CFormLabel htmlFor="search-diagnostico" className="small mb-1">
                  Buscar por diagnóstico
                </CFormLabel>
                <CFormInput
                  id="search-diagnostico"
                  size="sm"
                  className="py-1"
                  style={{ width: "100%", minWidth: "200px", maxWidth: "260px" }}
                  placeholder="Ej: diabetes"
                  value={diagnosticoTerm}
                  onChange={(e) => onDiagnosticoTermChange(e.target.value)}
                />
              </div>
            </CCol>
            <CCol xs={12} md="auto">
              <div className="d-flex flex-column">
                <CFormLabel htmlFor="sexo-dropdown" className="small mb-1">
                  Sexo
                </CFormLabel>
                <CDropdown className="d-inline-block">
                  <CDropdownToggle
                    id="sexo-dropdown"
                    color="light"
                    size="sm"
                    className="text-start d-flex align-items-center py-1"
                  >
                    {sexoFilter || "Seleccione..."}
                  </CDropdownToggle>
                  <CDropdownMenu style={{ minWidth: "max-content" }}>
                    <CDropdownItem onClick={() => onSexoFilterChange("")}>
                      Seleccione...
                    </CDropdownItem>
                    <CDropdownItem onClick={() => onSexoFilterChange("Masculino")}>
                      Masculino
                    </CDropdownItem>
                    <CDropdownItem onClick={() => onSexoFilterChange("Femenino")}>
                      Femenino
                    </CDropdownItem>
                    <CDropdownItem onClick={() => onSexoFilterChange("Otro")}>
                      Otro
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCollapse>
  );
}
