import {
  CButton,
  CCol,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from "@coreui/react";
import { useEffect, useRef } from "react";
import type { Cie10DTO, DiagnosticoDTO } from "../../api/pacientes";
import DiagnosticoAutocompleteFields from "../diagnostico/DiagnosticoAutocompleteFields";
import {
  autoResizeTextarea,
  sipacBlue,
} from "./diagnosticoUtils";

const formatDateTime = (raw?: string): string => {
  if (!raw) return "-";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

interface DiagnosticoModalProps {
  activeDiagnostico: DiagnosticoDTO | null;
  diagnosticoEditMode: boolean;
  selectedIndex: number | null;
  visible: boolean;
  onClose: () => void;
  onStartEdit: () => void;
  onDraftChange: (
    field: keyof DiagnosticoDTO,
    value: string | boolean | Cie10DTO | null,
  ) => void;
  onSave: () => void;
  onRemove: () => void;
}

export default function DiagnosticoModal({
  activeDiagnostico,
  diagnosticoEditMode,
  selectedIndex,
  visible,
  onClose,
  onStartEdit,
  onDraftChange,
  onSave,
  onRemove,
}: DiagnosticoModalProps) {
  const evolucionRef = useRef<HTMLTextAreaElement>(null);
  const tratamientoRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!diagnosticoEditMode) return;

    [evolucionRef.current, tratamientoRef.current].forEach((element) => {
      if (element) {
        autoResizeTextarea(element);
      }
    });
  }, [diagnosticoEditMode, activeDiagnostico?.evolucion, activeDiagnostico?.tratamiento]);

  return (
    <CModal visible={visible && Boolean(activeDiagnostico)} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>{diagnosticoEditMode ? "Editar diagnóstico" : "Diagnóstico"}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {activeDiagnostico ? (
          <div className="d-flex flex-column gap-3">
            <div className="d-flex justify-content-end align-items-center gap-2">
              {activeDiagnostico.principal ? (
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: "#E8F1FB",
                    color: sipacBlue,
                    border: `1px solid ${sipacBlue}33`,
                  }}
                >
                  Principal
                </span>
              ) : null}
            </div>

            {diagnosticoEditMode ? (
              <CRow className="g-3">
                <CCol md={12}>
                  <CFormCheck
                    id={`principal-${selectedIndex}`}
                    label="Diagnóstico principal"
                    checked={Boolean(activeDiagnostico.principal)}
                    onChange={(e) => onDraftChange("principal", e.target.checked)}
                  />
                </CCol>

                <CCol md={12}>
                  <DiagnosticoAutocompleteFields
                    descripcion={activeDiagnostico.descripcion || ""}
                    cie10={activeDiagnostico.cie10 || null}
                    onDescripcionChange={(value) => onDraftChange("descripcion", value)}
                    onCie10Change={(value) => onDraftChange("cie10", value)}
                    descripcionLabel="Descripción clínica"
                    descripcionPlaceholder="Describí el diagnóstico clínico"
                    descripcionRows={1}
                    fillDescriptionFromCie10={false}
                    clearCie10OnDescriptionEdit={false}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor={`evolucion-${selectedIndex}`}>Evolución</CFormLabel>
                  <CFormTextarea
                    ref={evolucionRef}
                    id={`evolucion-${selectedIndex}`}
                    rows={1}
                    style={{ resize: "none", overflow: "hidden" }}
                    value={activeDiagnostico.evolucion || ""}
                    onInput={(e) => autoResizeTextarea(e.currentTarget)}
                    onChange={(e) => onDraftChange("evolucion", e.target.value)}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor={`fechaFin-${selectedIndex}`}>Fecha fin</CFormLabel>
                  <CFormInput
                    id={`fechaFin-${selectedIndex}`}
                    type="datetime-local"
                    value={activeDiagnostico.fechaFin || ""}
                    onChange={(e) => onDraftChange("fechaFin", e.target.value)}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor={`tratamiento-${selectedIndex}`}>Tratamiento</CFormLabel>
                  <CFormTextarea
                    ref={tratamientoRef}
                    id={`tratamiento-${selectedIndex}`}
                    rows={1}
                    style={{ resize: "none", overflow: "hidden" }}
                    value={activeDiagnostico.tratamiento || ""}
                    onInput={(e) => autoResizeTextarea(e.currentTarget)}
                    onChange={(e) => onDraftChange("tratamiento", e.target.value)}
                  />
                </CCol>
              </CRow>
            ) : (
              (() => {
                const cie10Label = [
                  activeDiagnostico.cie10?.codigo?.trim(),
                  activeDiagnostico.cie10?.descripcion?.trim(),
                ]
                  .filter(Boolean)
                  .join(" - ");
                const diagnosticoFields = [
                  ...(activeDiagnostico.descripcion?.trim()
                    ? [
                        {
                          label: "Descripción clínica",
                          value: activeDiagnostico.descripcion.trim(),
                        },
                      ]
                    : []),
                  ...(cie10Label ? [{ label: "CIE-10", value: cie10Label }] : []),
                  ...(activeDiagnostico.evolucion?.trim()
                    ? [{ label: "Evolución", value: activeDiagnostico.evolucion.trim() }]
                    : []),
                  ...(activeDiagnostico.tratamiento?.trim()
                    ? [{ label: "Tratamiento", value: activeDiagnostico.tratamiento.trim() }]
                    : []),
                  ...(activeDiagnostico.fechaFin?.trim()
                    ? [{ label: "Fecha fin", value: formatDateTime(activeDiagnostico.fechaFin) }]
                    : []),
                ];

                return diagnosticoFields.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {diagnosticoFields.map((field) => (
                      <div key={field.label} className="border rounded p-3 bg-light-subtle">
                        <div className="small text-muted">{field.label}</div>
                        <div className="fw-semibold">{field.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="small text-muted">
                    No hay datos del diagnóstico para mostrar.
                  </div>
                );
              })()
            )}
          </div>
        ) : null}
      </CModalBody>
      <CModalFooter className="d-flex justify-content-between">
        <div className="d-flex gap-2">
          {diagnosticoEditMode ? (
            <CButton type="button" color="danger" variant="outline" onClick={onRemove}>
              Eliminar diagnóstico
            </CButton>
          ) : null}
        </div>
        <div className="d-flex gap-2">
          {!diagnosticoEditMode ? (
            <CButton type="button" color="primary" variant="outline" onClick={onStartEdit}>
              Editar
            </CButton>
          ) : null}
          {diagnosticoEditMode ? (
            <CButton type="button" color="primary" onClick={onSave}>
              Guardar
            </CButton>
          ) : null}
          <CButton type="button" color="secondary" variant="outline" onClick={onClose}>
            Cerrar
          </CButton>
        </div>
      </CModalFooter>
    </CModal>
  );
}
