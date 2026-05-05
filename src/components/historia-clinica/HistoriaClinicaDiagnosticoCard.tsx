import {
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CButton,
} from "@coreui/react";
import { GiBrain } from "react-icons/gi";
import InfoList from "./InfoList";
import { FiEye } from "react-icons/fi";
import { useState } from "react";
interface Field {
  label: string;
  value: string;
}

interface Props {
  diagnosticoPrincipal: Record<string, unknown> | null;
  diagnosticoFields: Field[];
  onViewDiagnosticos: () => void;
}

export default function HistoriaClinicaDiagnosticoCard({
  diagnosticoPrincipal,
  diagnosticoFields,
  onViewDiagnosticos,
}: Props) {

     const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onViewDiagnosticos();
    } finally {
      setLoading(false);
    }
  }; 
  return (
    <CAccordionItem itemKey={2}>
      {/* HEADER IGUAL QUE GENERAL */}
      <CAccordionHeader className="hc-header d-flex align-items-center">
       
          
          {/* IZQUIERDA */}
          <span className="hc-title d-flex align-items-center gap-2">
            <GiBrain />
            Diagnóstico
          </span>

          {/* DERECHA */}
          {diagnosticoPrincipal && (
            <div className="ms-auto">
              <span className="badge rounded-pill px-3 py-2 bg-success-subtle text-success">
                Principal
              </span>
            </div>
          )}
        
      </CAccordionHeader>

      {/* BODY IGUAL ESTRUCTURA QUE GENERAL */}
      <CAccordionBody className="px-2 py-1">
        {!diagnosticoPrincipal ? (
          <div className="small text-muted">
            Sin diagnóstico cargado.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">

            {/* SOLO DATOS */}
            <InfoList
              fields={diagnosticoFields}
              emptyText="No hay datos del diagnóstico."
            />

            {/* ACCIÓN */}
      {/* BOTÓN PRO */}
            <div className="d-flex justify-content-end">
              <button
                className="hc-action-btn d-flex align-items-center gap-2"
                onClick={handleClick}
                disabled={loading}
              >
                <FiEye
                  size={16}
                  className={`hc-icon ${loading ? "spin" : ""}`}
                />

                <span>
                  {loading ? "Cargando..." : "Ver diagnósticos"}
                </span>
              </button>
            </div>
          </div>
        )}
      </CAccordionBody>
    </CAccordionItem>
  );
}