import {
  CCard,
  CCardBody,
  CFormInput,
  CFormSelect,
} from "@coreui/react";

import { BsSearch } from "react-icons/bs";

import type { TipoDiagnostico } from "../../../api/pacientes";

interface DiagnosticoFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  estadoFilter: "all" | "active" | "closed";
  onEstadoFilterChange: (
    value: "all" | "active" | "closed"
  ) => void;

  tipoDiagnosticoFilter: TipoDiagnostico | "all";
  onTipoDiagnosticoFilterChange: (
    value: TipoDiagnostico | "all"
  ) => void;

  tiposDiagnostico: TipoDiagnostico[] ;

  tipoDiagnosticoLabels: Record<
    TipoDiagnostico,
    string
  >;
}

export default function DiagnosticoFilters({
  search,
  onSearchChange,
  estadoFilter,
  onEstadoFilterChange,
  tipoDiagnosticoFilter,
  onTipoDiagnosticoFilterChange,
  tiposDiagnostico,
  tipoDiagnosticoLabels,
}: DiagnosticoFiltersProps) {
  return (
    <CCard className="border-0 shadow-sm mb-4">
      <CCardBody>
        
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-end">

       <div
  style={{ width: "50%" }}
>
  <div className="small text-muted mb-1 opacity-1">
    Buscar
  </div>

  <div className="position-relative">
    <BsSearch
      className="position-absolute text-muted"
      style={{
        left: 12,
        top: "50%",
        transform: "translateY(-50%)",
      }}
    />

    <CFormInput
      value={search}
      onChange={(e) =>
        onSearchChange(e.target.value)
      }
      placeholder="Descripción, CIE-10, evolución o tratamiento"
      style={{ paddingLeft: 36 }}
      size="sm"
    />
  </div>
</div>

          <div className="d-flex flex-column flex-md-row gap-3">

            <div>
              <div className="small text-muted mb-1">
                Tipo diagnóstico
              </div>

              <CFormSelect
                size="sm"
                value={tipoDiagnosticoFilter}
                onChange={(e) =>
                  onTipoDiagnosticoFilterChange(
                    e.target.value as TipoDiagnostico | "all"
                  )
                }
                style={{ minWidth: 220 }}
              >
                <option value="all">
                  Todos
                </option>

                {tiposDiagnostico.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipoDiagnosticoLabels[tipo]}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div>
              <div className="small text-muted mb-1">
                Estado
              </div>

              <CFormSelect
                size="sm"
                value={estadoFilter}
                onChange={(e) =>
                  onEstadoFilterChange(
                    e.target.value as
                      | "all"
                      | "active"
                      | "closed"
                  )
                }
                style={{ minWidth: 180 }}
              >
                <option value="all">
                  Todos los estados
                </option>

                <option value="active">
                  Activos
                </option>

                <option value="closed">
                  Finalizados
                </option>
              </CFormSelect>
            </div>

          </div>
        </div>
      </CCardBody>
    </CCard>
  );
}