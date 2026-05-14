import {
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CBadge,
} from "@coreui/react";
import { GiBrain } from "react-icons/gi";
import InfoList from "./InfoList";
import { FiEye , FiClock } from "react-icons/fi";
import { useState } from "react";
import { getDiagnosticoPrincipal } from "./diagnosticoUtils";


interface Field {
  label: string;
  value: string;
}

interface EvolucionItem {
  fecha: string;
  nota: string;
}

interface DiagnosticoItem {
  principal?: boolean;
  activo?: boolean;
}

interface Props {
  diagnosticoFields: Field[];
   diagnosticos?: DiagnosticoItem[];
  evoluciones?: EvolucionItem[];
  onViewDiagnosticos: () => void;
}

export default function HistoriaClinicaDiagnosticoCard({
  diagnosticoFields,
  diagnosticos,
  evoluciones,
  onViewDiagnosticos,
}: Props) {

     const [loading, setLoading] = useState(false);

const diagnosticoPrincipal = getDiagnosticoPrincipal(
  (diagnosticos as Record<string, unknown>[]) ?? [],
);

const tieneDiagnosticoPrincipal = !!diagnosticoPrincipal;
    
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
        {/* {diagnosticoPrincipal && (
            <div className="ms-auto">
              <span className="badge rounded-pill px-3 py-2 bg-success-subtle text-success">
                Principal
              </span>
            </div>
          )} */}
      </CAccordionHeader>

      {/* BODY IGUAL ESTRUCTURA QUE GENERAL */}
<CAccordionBody className="px-2 py-1">
  {diagnosticoFields.length === 0 ? (
    <div className="small text-muted">
      Sin diagnóstico cargado.
    </div>
  ) : (
    <div className="d-flex flex-column gap-3">

      {!tieneDiagnosticoPrincipal && (
        <div>
          <CBadge
            color="light"
            className="hc-status-badge hc-status-inactive"
          >
            Sin diagnóstico principal
          </CBadge>
        </div>
      )}

      <InfoList
        fields={diagnosticoFields}
        emptyText="No hay datos del diagnóstico."
      />

      {evoluciones && evoluciones.length > 0 && (
        <div className="d-flex flex-column gap-2">

          <div
            className="small text-muted d-flex align-items-center gap-2 fw-semibold"
          >
            <FiClock size={14} />
            <span>Seguimiento clínico</span>
          </div>

          {evoluciones.slice(0, 3).map((evolucion, index) => (
            <div
              key={index}
              className="border rounded px-3 py-2 bg-light-subtle"
            >
              <div
                className="d-flex align-items-start gap-3"
                style={{ fontSize: "0.9rem" }}
              >
                <div
                  className="text-muted flex-shrink-0"
                  style={{
                    minWidth: "120px",
                    fontSize: "0.78rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Intl.DateTimeFormat("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(evolucion.fecha))}
                </div>

                <div
                  className="text-body"
                  style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.4,
                  }}
                >
                  {evolucion.nota}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="d-flex justify-content-start">
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
