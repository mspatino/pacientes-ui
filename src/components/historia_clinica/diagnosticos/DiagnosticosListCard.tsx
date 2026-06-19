import {
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
} from "@coreui/react";
import { BsPencilSquare, BsPlusLg, BsTrash } from "react-icons/bs";
import { FiClock } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";
import type { DiagnosticoDTO } from "../../../api/pacientes";
import {
  formatFechaHora,
  getDiagnosticoTipoBadgeStyle,
  getDiagnosticoTipoLabel,
} from "./diagnosticoUtils";

interface DiagnosticosListCardProps {
  diagnosticos: DiagnosticoDTO[];
  onOpen: (index: number) => void;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void | Promise<void>;
  readOnly?: boolean;
  variant?: "accordion" | "panel";
}

const getDiagnosticoTitulo = (diagnostico: DiagnosticoDTO) => {
  const descripcion = diagnostico.descripcion?.trim() ?? "";
  const cie10Codigo = diagnostico.cie10?.codigo?.trim() ?? "";
  const cie10Descripcion = diagnostico.cie10?.descripcion?.trim() ?? "";

  if (cie10Codigo) {
    return [cie10Codigo, cie10Descripcion || descripcion]
      .filter(Boolean)
      .join(" ");
  }

  return descripcion || "Sin diagnóstico";
};

export default function DiagnosticosListCard({
  diagnosticos,
  onOpen,
  onAdd,
  onEdit,
  onRemove,
  readOnly = false,
  variant = "accordion",
}: DiagnosticosListCardProps) {
  const headerContent = (
    <span className="hc-header-row">
      {variant === "accordion" ? (
        <span className="hc-title d-flex align-items-center gap-2">
          <GiBrain />
          Diagnósticos
        </span>
      ) : null}

      {!readOnly ? (
        <button
          type="button"
          className="hc-action-btn hc-action-btn-sm d-flex align-items-center gap-2"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onAdd();
          }}
        >
          <BsPlusLg size={13} />
          Agregar
        </button>
      ) : null}
    </span>
  );

  const bodyContent = (
    <>
      {diagnosticos.length === 0 ? (
        <div className="small text-muted">
          Todavía no hay diagnósticos cargados para esta historia clínica.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2 mb-3">
        

          {diagnosticos.map((diagnostico, index) => {
            const evoluciones = diagnostico.evoluciones ?? [];
            const diagnosticoTitulo = getDiagnosticoTitulo(diagnostico);

            return (
              <div
                key={index}
                className="sipac-diagnostico-item"
                role="button"
                tabIndex={0}
                onClick={() => onOpen(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(index);
                  }
                }}
              >
                <div className="d-flex flex-column gap-1">

                  {/* HEADER */}
          
                  <div className="d-flex justify-content-between align-items-start gap-2">

                    {/* TIPO */}
                    <span
                      className="badge rounded-pill"
                      style={getDiagnosticoTipoBadgeStyle(diagnostico.tipo)}
                    >
                      {getDiagnosticoTipoLabel(diagnostico.tipo)}
                    </span>

                    {/* FECHAS */}
                    <div className="sipac-diagnostico-fechas d-flex align-items-center gap-2 flex-wrap text-body-secondary ms-auto">

                      {diagnostico.fechaInicio ? (
                        <span>
                          <span
                            className="badge rounded-pill me-1"
                            style={{
                              backgroundColor: "#F6F8F6",
                              color: "#6C8A6D",
                              border: "1px solid #DCE6DC",
                            }}
                          >
                            Inicio
                          </span>

                          {formatFechaHora(diagnostico.fechaInicio)}
                        </span>
                      ) : null}

                      {diagnostico.fechaFin ? (
                        <span>
                          <span
                            className="badge rounded-pill me-1"
                            style={{
                              backgroundColor: "#FAF8F5",
                              color: "#9A7B5F",
                              border: "1px solid #E8DDD2",
                            }}
                          >
                            Alta
                          </span>

                          {formatFechaHora(diagnostico.fechaFin)}
                        </span>
                      ) : null}
                    </div>

                    {!readOnly ? (
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          className="hc-action-btn hc-action-btn-sm d-flex align-items-center gap-1"
                          title="Editar diagnóstico"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onEdit(index);
                          }}
                        >
                          <BsPencilSquare size={13} />
                          Editar
                        </button>

                        <button
                          type="button"
                          className="hc-action-btn hc-action-btn-sm hc-action-btn-danger d-flex align-items-center gap-1"
                          title="Eliminar diagnóstico"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (!window.confirm("¿Eliminar este diagnóstico?")) return;
                            void onRemove(index);
                          }}
                        >
                          <BsTrash size={13} />
                          Eliminar
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {/* DESCRIPCION */}
                  <div className="sipac-diagnostico-title">
                    {diagnosticoTitulo}
                  </div>

                  {/* TRATAMIENTO */}
                  {diagnostico.tratamiento?.trim() ? (
                    <div className="small text-body-secondary">
                      Tratamiento: {diagnostico.tratamiento.trim()}
                    </div>
                  ) : null}

                  {/* EVOLUCIONES */}
                  {evoluciones.length > 0 ? (
                    <div className="sipac-seguimiento-mini sipac-seguimiento-historia-list">
                      <div className="sipac-seguimiento-header">
                        <FiClock size={14} />
                        <span className="sipac-seguimiento-title">
                          Seguimiento clínico
                        </span>
                      </div>

                      {evoluciones.map((evolucion, evolucionIndex) => {
                        const nota =
                          evolucion.nota?.trim() ||
                          evolucion.evolucion?.trim() ||
                          evolucion.descripcion?.trim() ||
                          "";

                        return nota ? (
                          <div
                            key={evolucion.id ?? `${evolucion.fecha ?? "evolucion"}-${evolucionIndex}`}
                            className="sipac-seguimiento-item"
                          >
                            <span className="sipac-seguimiento-fecha">
                              {formatFechaHora(evolucion.fecha)}
                            </span>

                            <span className="sipac-seguimiento-nota">
                              {nota}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  if (variant === "panel") {
    return (
      <section className="sipac-hc-tab-section">
        {!readOnly ? (
          <div className="sipac-hc-tab-section-actions">
            {headerContent}
          </div>
        ) : null}

        <div className="px-2 py-1">
          {bodyContent}
        </div>
      </section>
    );
  }

  return (
    <CAccordionItem itemKey={2} className="hc-item hc-diagnosticos-section">
      <CAccordionHeader className="hc-header d-flex align-items-center">
        {headerContent}
      </CAccordionHeader>

      <CAccordionBody className="px-2 py-1">
        {bodyContent}
      </CAccordionBody>
    </CAccordionItem>
  );
}
