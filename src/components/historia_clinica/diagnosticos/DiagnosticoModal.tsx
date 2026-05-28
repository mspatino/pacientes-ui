import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from "@coreui/react";

import { GiBrain } from "react-icons/gi";

import type { Cie10DTO, DiagnosticoDTO } from "../../../api/pacientes";

import DiagnosticoForm from "./DiagnosticoForm";
import type { DiagnosticoModalMode } from "./diagnosticoUtils";

interface DiagnosticoModalProps {
  activeDiagnostico: DiagnosticoDTO | null;
  editingIndex: number | null;
  mode: DiagnosticoModalMode;
  visible: boolean;
  onClose: () => void;
  onStartEdit: () => void;
  onDraftChange: (
    field: keyof DiagnosticoDTO,
    value: string | boolean | Cie10DTO | null,
  ) => void;
  onSave: () => void;
  onRemove: () => void;
  onDiagnosticoReload?: () => void | Promise<void>;
  readOnly?: boolean;
}

export default function DiagnosticoModal({
  activeDiagnostico,
  editingIndex,
  mode,
  visible,
  onClose,
  onStartEdit,
  onDraftChange,
  onSave,
  onRemove,
  onDiagnosticoReload,
  readOnly = false,
}: DiagnosticoModalProps) {

  const isEditing =
    !readOnly && (mode === "edit" || mode === "create");

  return (
    <CModal
      visible={visible && Boolean(activeDiagnostico)}
      onClose={onClose}
      size="lg"
    >
      <CModalHeader
  style={{
    backgroundColor: "#F3F4F7",
    borderBottom: "1px solid #E5E7EB",
    paddingTop: "0.9rem",
    paddingBottom: "0.9rem",
  }}
>
        <CModalTitle 
        className="d-flex align-items-center gap-2"
        style={{
          color: "#2F6FB3",
          fontWeight: 600,
        }}>
          <GiBrain size={20} color="#2F6FB3" />

          {mode === "create"
            ? "Nuevo diagnóstico"
            : mode === "edit"
              ? "Editar diagnóstico"
              : "Diagnóstico"}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {activeDiagnostico ? (
          <DiagnosticoForm
            diagnostico={activeDiagnostico}
            editingIndex={editingIndex}
            isEditing={isEditing}
            onDraftChange={onDraftChange}
            reloadDiagnostico={onDiagnosticoReload}
          />
        ) : null}
      </CModalBody>

      <CModalFooter className="d-flex justify-content-between">

        <div>
          {!readOnly && mode === "edit" ? (
            <CButton
              type="button"
              color="danger"
              variant="outline"
              onClick={onRemove}
            >
              Eliminar diagnóstico
            </CButton>
          ) : null}
        </div>

        <div className="d-flex gap-2">

          {!readOnly && mode === "view" ? (
            <CButton
              type="button"
              color="primary"
              variant="outline"
              onClick={onStartEdit}
            >
              Editar
            </CButton>
          ) : null}

          {isEditing ? (
            <CButton
              type="button"
              color="primary"
              onClick={onSave}
            >
              Guardar
            </CButton>
          ) : null}

          <CButton
            type="button"
            color="secondary"
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </CButton>
        </div>
      </CModalFooter>
    </CModal>
  );
}
