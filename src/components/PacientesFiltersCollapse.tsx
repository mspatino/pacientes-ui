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
  sexoFilter: SexoFilter;
  onSexoFilterChange: (value: SexoFilter) => void;
}

export default function PacientesFiltersCollapse({
  showFilters,
  searchTerm,
  onSearchTermChange,
  sexoFilter,
  onSexoFilterChange,
}: PacientesFiltersCollapseProps) {
  return (
    <CCollapse visible={showFilters}>
      <CCard
        className="border-0 shadow-sm"
        style={{
          background: "#F8FBFF",
          borderRadius: "14px",
        }}
      >
        <CCardBody className="py-3 px-3">
          <CRow className="g-3 align-items-end">
            <CCol xs={12} md={7}>
              <div className="d-flex flex-column">
                <CFormLabel
                  htmlFor="search-paciente"
                  className="small fw-semibold mb-1"
                  style={{ color: "#4B6178" }}
                >
                  Búsqueda rápida
                </CFormLabel>

                <CFormInput
                  id="search-paciente"
                  size="sm"
                  className="py-2 border-0 shadow-sm"
                  style={{
                    background: "#ffffff",
                    borderRadius: "10px",
                  }}
                  placeholder="Apellido, nombre o DNI..."
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                />
              </div>
            </CCol>

            <CCol xs={12} md="auto">
              <div className="d-flex flex-column">
                <CFormLabel
                  htmlFor="sexo-dropdown"
                  className="small fw-semibold mb-1"
                  style={{ color: "#4B6178" }}
                >
                  Sexo
                </CFormLabel>

                <CDropdown className="d-inline-block">
                  <CDropdownToggle
                    id="sexo-dropdown"
                    color="light"
                    size="sm"
                    className="text-start d-flex align-items-center py-2 border-0 shadow-sm"
                    style={{
                      minWidth: "170px",
                      borderRadius: "10px",
                      background: "#ffffff",
                    }}
                  >
                    {sexoFilter || "Todos"}
                  </CDropdownToggle>

                  <CDropdownMenu style={{ minWidth: "170px" }}>
                    <CDropdownItem onClick={() => onSexoFilterChange("")}>
                      Todos
                    </CDropdownItem>

                    <CDropdownItem
                      onClick={() => onSexoFilterChange("Masculino")}
                    >
                      Masculino
                    </CDropdownItem>

                    <CDropdownItem
                      onClick={() => onSexoFilterChange("Femenino")}
                    >
                      Femenino
                    </CDropdownItem>

                    <CDropdownItem
                      onClick={() => onSexoFilterChange("Otro")}
                    >
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