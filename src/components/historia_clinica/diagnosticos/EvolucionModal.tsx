import {
  CFormLabel,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from "@coreui/react";
import { useState } from "react";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (nota: string) => void | Promise<void>;
}

export default function EvolucionModal({
  visible,
  onClose,
  onSave,
}: Props) {
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedNota = nota.trim();
    if (!trimmedNota || saving) return;

    setSaving(true);
    try {
      await onSave(trimmedNota);
      setNota("");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setNota("");
    onClose();
  };

  return (
    <CModal
      visible={visible}
      onClose={handleClose}
      alignment="center"
      className="sipac-evolucion-modal"
    >
      <CModalHeader
        style={{
          backgroundColor: "#F3F4F7",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <CModalTitle
          style={{
            color: "#2F6FB3",
            fontWeight: 600,
          }}
        >
          Nueva evolución
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="sipac-evolucion-body">
        <CFormLabel className="sipac-label">Nota</CFormLabel>
        <CFormTextarea
          className="sipac-input"
          rows={5}
          value={nota}
          onChange={(event) => setNota(event.target.value)}
        />
      </CModalBody>

      <CModalFooter className="sipac-confirm-footer border-top">
        <button
          type="button"
          className="sipac-confirm-btn"
          onClick={handleClose}
          disabled={saving}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="sipac-confirm-btn sipac-confirm-btn-primary"
          onClick={handleSave}
          disabled={!nota.trim() || saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </CModalFooter>
    </CModal>
  );
}
