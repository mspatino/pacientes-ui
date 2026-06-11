import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from "@coreui/react";

import { GiBrain } from "react-icons/gi";

import type { Cie10DTO, DiagnosticoDTO, EvolucionDiagnosticoDTO } from "../../../api/pacientes";

import DiagnosticoForm from "./DiagnosticoForm";
import type { DiagnosticoModalMode } from "./diagnosticoUtils";

interface DiagnosticoModalProps {
  activeDiagnostico: DiagnosticoDTO | null;
  editingIndex: number | null;
  mode: DiagnosticoModalMode;
  visible: boolean;
  onClose: () => void;
  onDraftChange: (
    field: keyof DiagnosticoDTO,
    value: string | boolean | Cie10DTO | EvolucionDiagnosticoDTO[] | null,
  ) => void;
  onSave: () => void;
  onDiagnosticoReload?: () => void | Promise<void>;
  readOnly?: boolean;
}

export default function DiagnosticoModal({
  activeDiagnostico,
  editingIndex,
  mode,
  visible,
  onClose,
  onDraftChange,
  onSave,
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

      <CModalFooter className="sipac-form-footer border-top">

          {isEditing ? (
            <button
              type="button"
              className="sipac-toolbar-btn"
              onClick={onSave}
            >
              Guardar
            </button>
          ) : null}

          <button
            type="button"
            className="sipac-toolbar-btn"
            onClick={onClose}
          >
            {isEditing ? "Cancelar" : "Cerrar"}
          </button>
      </CModalFooter>
    </CModal>
  );
}
