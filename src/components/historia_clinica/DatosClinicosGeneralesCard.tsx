import { useEffect, useRef } from "react";
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
  const motivoConsultaRef = useRef<HTMLTextAreaElement>(null);
  const medicacionRef = useRef<HTMLTextAreaElement>(null);
  const consumoRef = useRef<HTMLTextAreaElement>(null);
  const tratamientosAnterioresRef = useRef<HTMLTextAreaElement>(null);
  const observacionesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    [
      motivoConsultaRef.current,
      medicacionRef.current,
      consumoRef.current,
      tratamientosAnterioresRef.current,
      observacionesRef.current,
    ].forEach((element) => {
      if (element) {
        autoResizeTextarea(element);
      }
    });
  }, [
    form.motivoConsulta,
    form.medicacion,
    form.consumo,
    form.tratamientosAnteriores,
    form.observaciones,
  ]);

  return (
    <CCard className="sipac-form-card">
      <CCardHeader>Datos clínicos generales</CCardHeader>
      <CCardBody>
        <CRow className="g-3">
          <CCol md={10}>
            <CFormLabel htmlFor="motivoConsulta">Motivo de consulta</CFormLabel>
            <CFormTextarea
              ref={motivoConsultaRef}
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
              ref={medicacionRef}
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
              ref={consumoRef}
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
              ref={tratamientosAnterioresRef}
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
              ref={observacionesRef}
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
