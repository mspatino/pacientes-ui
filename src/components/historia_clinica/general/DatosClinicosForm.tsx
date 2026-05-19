import { CCol, CFormCheck, CRow } from "@coreui/react";
import type { HistoriaClinicaPayload } from "../../../api/pacientes";

import SipacTextarea from "../../SipacTextarea";

interface DatosClinicosFormProps {
  form: HistoriaClinicaPayload;
  setForm: React.Dispatch<React.SetStateAction<HistoriaClinicaPayload>>;
}

export default function DatosClinicosForm({
  form,
  setForm,
}: DatosClinicosFormProps) {
  return (
    <CRow className="g-3">
      <CCol md={10}>
        <CCol md={10}>
          <SipacTextarea
            id="motivoConsulta"
            label="Motivo de consulta"
            value={form.motivoConsulta}
            required
            rows={2}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                motivoConsulta: value,
              }))
            }
          />
        </CCol>
      </CCol>
      <CCol md={2} className="d-flex align-items-center pt-4">
        <CFormCheck
          id="historiaActiva"
          label="Activa"
          checked={Boolean(form.activa)}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, activa: e.target.checked }))
          }
        />
      </CCol>

      <CCol md={6}>
        <SipacTextarea
          id="medicacion"
          label="Medicación"
          value={form.medicacion || ""}
          rows={2}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              medicacion: value,
            }))
          }
        />
      </CCol>

      <CCol md={6}>
        <SipacTextarea
          id="consumo"
          label="Consumo"
          value={form.consumo || ""}
          rows={2}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              consumo: value,
            }))
          }
        />
      </CCol>

      <CCol md={6}>
        <SipacTextarea
          id="tratamientosAnteriores"
          label="Tratamientos anteriores"
          value={form.tratamientosAnteriores || ""}
          rows={2}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              tratamientosAnteriores: value,
            }))
          }
        />
      </CCol>

      <CCol md={6}>
        <SipacTextarea
          id="observaciones"
          label="Observaciones"
          value={form.observaciones || ""}
          rows={2}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              observaciones: value,
            }))
          }
        />
      </CCol>
    </CRow>
  );
}
