import CIcon from "@coreui/icons-react";
import { cilList } from "@coreui/icons";
import {
  CButton,
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
  onToggleFilters: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  diagnosticoTerm: string;
  onDiagnosticoTermChange: (value: string) => void;
  sexoFilter: SexoFilter;
  onSexoFilterChange: (value: SexoFilter) => void;
}

export default function PacientesFiltersCollapse({
  showFilters,
  onToggleFilters,
  searchTerm,
  onSearchTermChange,
  diagnosticoTerm,
  onDiagnosticoTermChange,
  sexoFilter,
  onSexoFilterChange,
}: PacientesFiltersCollapseProps) {
  return (
    <>
      <CButton
        color="primary"
        variant="outline"
        className="mb-3 d-inline-flex align-items-center gap-2"
        onClick={onToggleFilters}
      >
        <CIcon icon={cilList} size="sm" />
        Filtro
      </CButton>

      <CCollapse visible={showFilters}>
        <CCard className="mb-3">
          <CCardBody>
            <CRow className="g-3">
              <CCol xs={12} md={4}>
                <CFormInput
                  label="Apellido/ Nombres, DNI"
                  placeholder="Ej: 30123456 o Perez Juan"
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                />
              </CCol>
              <CCol xs={12} md={4}>
                <CFormInput
                  label="Buscar por diagnóstico"
                  placeholder="Ej: diabetes"
                  value={diagnosticoTerm}
                  onChange={(e) => onDiagnosticoTermChange(e.target.value)}
                />
              </CCol>
              <CCol xs={12} md={4}>
                <div className="d-flex flex-column">
                  <CFormLabel htmlFor="sexo-dropdown">Sexo</CFormLabel>
                  <CDropdown>
                    <CDropdownToggle
                      id="sexo-dropdown"
                      color="light"
                      className="w-100 text-start d-flex align-items-center"
                    >
                      {sexoFilter || "Seleccione..."}
                    </CDropdownToggle>
                    <CDropdownMenu className="w-100">
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
    </>
  );
}
