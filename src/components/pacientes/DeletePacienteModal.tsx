import {
  CAlert,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from "@coreui/react";

interface DeletePacienteModalProps {
  visible: boolean;
  deleting: boolean;
  pacienteNombreCompleto: string;
  actionError: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeletePacienteModal({
  visible,
  deleting,
  pacienteNombreCompleto,
  actionError,
  onClose,
  onConfirm,
}: DeletePacienteModalProps) {
  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Eliminar paciente</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {actionError ? (
          <CAlert color="danger" className="mb-3">
            {actionError}
          </CAlert>
        ) : null}

        <p className="mb-0">
          ¿Está seguro que desea eliminar al paciente{" "}
          <strong>{pacienteNombreCompleto}</strong>?
        </p>
      </CModalBody>

      <CModalFooter className="d-flex gap-2">
        <CButton
          color="primary"
          onClick={onConfirm}
          disabled={deleting}
        >
          {deleting ? "Eliminando..." : "Eliminar"}
        </CButton>

        <CButton
          color="secondary"
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </CButton>
      </CModalFooter>
    </CModal>
  );
}