import {
  //CCard,
  //CCardBody,
  CCollapse,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
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
  // return (
  //   <CCollapse visible={showFilters}>
  //     <CCard className="sipac-filters-card border-0">
  //       <CCardBody className="py-2 px-2">
  //         <CRow className="g-2 align-items-end">
  //           <CCol xs={12} md={7}>
  //             <div className="d-flex flex-column">
  //               <CFormLabel
  //                 htmlFor="search-paciente"
  //                 className="sipac-label"
  //               >
  //                 Búsqueda rápida
  //               </CFormLabel>

  //               <CFormInput
  //                 id="search-paciente"
  //                 className="sipac-input"
  //                 placeholder="Apellido, nombre o DNI..."
  //                 value={searchTerm}
  //                 onChange={(e) => onSearchTermChange(e.target.value)}
  //               />
  //             </div>
  //           </CCol>

  //           <CCol xs={12} md="auto">
  //             <div className="d-flex flex-column">
  //               <CFormLabel
  //                 htmlFor="sexo-dropdown"
  //                 className="sipac-label"
  //               >
  //                 Sexo
  //               </CFormLabel>

  //               <CFormSelect
  //                   id="sexo-dropdown"
  //                   className="sipac-select sipac-filter-select"
  //                   value={sexoFilter}
  //                   onChange={(event) =>
  //                     onSexoFilterChange(event.target.value as SexoFilter)
  //                   }
  //                 >
  //                   <option value="">
  //                     Todos
  //                   </option>
  //                   <option value="Masculino">
  //                     Masculino
  //                   </option>
  //                   <option value="Femenino">
  //                     Femenino
  //                   </option>
  //                   <option value="Otro">
  //                     Otro
  //                   </option>
  //               </CFormSelect>
  //             </div>
  //           </CCol>
  //         </CRow>
  //       </CCardBody>
  //     </CCard>
  //   </CCollapse>
  // );
  return (
  <CCollapse visible={showFilters}>
    <div className="sipac-filters-compact">
      <CRow className="g-2 align-items-end">
        <CCol xs={12} md={7}>
          <div className="d-flex flex-column">
            <CFormLabel htmlFor="search-paciente" className="sipac-label">
              Búsqueda rápida
            </CFormLabel>

            <CFormInput
              id="search-paciente"
              className="sipac-input"
              placeholder="Apellido, nombre o DNI..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>
        </CCol>

        <CCol xs={12} md="auto">
          <div className="d-flex flex-column">
            <CFormLabel htmlFor="sexo-dropdown" className="sipac-label">
              Sexo
            </CFormLabel>

            <CFormSelect
              id="sexo-dropdown"
              className="sipac-select sipac-filter-select"
              value={sexoFilter}
              onChange={(event) =>
                onSexoFilterChange(event.target.value as SexoFilter)
              }
            >
              <option value="">Todos</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </CFormSelect>
          </div>
        </CCol>
      </CRow>
    </div>
  </CCollapse>
);
}
