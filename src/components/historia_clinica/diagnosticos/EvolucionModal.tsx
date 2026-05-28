import {
  CButton,
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
    <CModal visible={visible} onClose={handleClose}>
      <CModalHeader>
        <CModalTitle>Nueva evolución</CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CFormLabel className="sipac-label">Nota</CFormLabel>
        <CFormTextarea
          className="sipac-input"
          rows={5}
          value={nota}
          onChange={(event) => setNota(event.target.value)}
        />
      </CModalBody>

      <CModalFooter>
        <CButton
          type="button"
          color="secondary"
          variant="outline"
          onClick={handleClose}
          disabled={saving}
        >
          Cancelar
        </CButton>

        <CButton
          type="button"
          color="primary"
          onClick={handleSave}
          disabled={!nota.trim() || saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
}
