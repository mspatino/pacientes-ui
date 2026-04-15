import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormCheck,
  CFormLabel,
  CFormTextarea,
  CRow,
} from "@coreui/react";
import type { HistoriaClinicaPayload } from "../../api/pacientes";
import { autoResizeTextarea } from "./diagnosticoUtils";

interface DatosClinicosGeneralesCardProps {
  form: HistoriaClinicaPayload;
  setForm: React.Dispatch<React.SetStateAction<HistoriaClinicaPayload>>;
}

export default function DatosClinicosGeneralesCard({
  form,
  setForm,
}: DatosClinicosGeneralesCardProps) {
  return (
    <CCard className="sipac-form-card">
      <CCardHeader>Datos clínicos generales</CCardHeader>
      <CCardBody>
        <CRow className="g-3">
          <CCol md={10}>
            <CFormLabel htmlFor="motivoConsulta">Motivo de consulta</CFormLabel>
            <CFormTextarea
              id="motivoConsulta"
              value={form.motivoConsulta}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, motivoConsulta: e.target.value }))
              }
              rows={2}
              required
              style={{ resize: "vertical", overflow: "hidden" }}
              onInput={(e) => autoResizeTextarea(e.currentTarget)}
            />
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
            <CFormLabel htmlFor="medicacion">Medicación</CFormLabel>
            <CFormTextarea
              id="medicacion"
              value={form.medicacion || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, medicacion: e.target.value }))
              }
              rows={1}
              style={{ resize: "none", overflow: "hidden" }}
              onInput={(e) => autoResizeTextarea(e.currentTarget)}
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="consumo">Consumo</CFormLabel>
            <CFormTextarea
              id="consumo"
              value={form.consumo || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, consumo: e.target.value }))
              }
              rows={1}
              style={{ resize: "none", overflow: "hidden" }}
              onInput={(e) => autoResizeTextarea(e.currentTarget)}
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="tratamientosAnteriores">Tratamientos anteriores</CFormLabel>
            <CFormTextarea
              id="tratamientosAnteriores"
              value={form.tratamientosAnteriores || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tratamientosAnteriores: e.target.value,
                }))
              }
              rows={1}
              style={{ resize: "none", overflow: "hidden" }}
              onInput={(e) => autoResizeTextarea(e.currentTarget)}
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="observaciones">Observaciones</CFormLabel>
            <CFormTextarea
              id="observaciones"
              value={form.observaciones || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, observaciones: e.target.value }))
              }
              rows={1}
              style={{ resize: "none", overflow: "hidden" }}
              onInput={(e) => autoResizeTextarea(e.currentTarget)}
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
}
