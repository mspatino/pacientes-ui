import {
  CCol,
  CFormInput,
  CFormLabel,
  CFormSwitch,
  CRow,
} from "@coreui/react";
import type { HistoriaClinicaPayload } from "../../../api/pacientes";

import SipacTextarea from "../../SipacTextarea";

interface DatosClinicosFormProps {
  form: HistoriaClinicaPayload;
  setForm: React.Dispatch<React.SetStateAction<HistoriaClinicaPayload>>;
  section: "consulta" | "antecedentes" | "observaciones";
}

const formatFechaAlta = (raw?: string) => {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function DatosClinicosForm({
  form,
  setForm,
  section,
}: DatosClinicosFormProps) {
  if (section === "antecedentes") {
    return (
      <CRow className="g-3">
        <CCol md={6}>
          <SipacTextarea
            id="antecedentesPersonales"
            label="Antecedentes personales"
            value={form.antecedentesPersonales || ""}
            rows={3}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, antecedentesPersonales: value }))
            }
          />
        </CCol>

        <CCol md={6}>
          <SipacTextarea
            id="antecedentesFamiliares"
            label="Antecedentes familiares"
            value={form.antecedentesFamiliares || ""}
            rows={3}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, antecedentesFamiliares: value }))
            }
          />
        </CCol>

        <CCol md={6}>
          <SipacTextarea
            id="contextoSocial"
            label="Contexto social"
            value={form.contextoSocial || ""}
            rows={3}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, contextoSocial: value }))
            }
          />
        </CCol>

        <CCol md={6}>
          <SipacTextarea
            id="actividadesVidaDiaria"
            label="Actividades de vida diaria"
            value={form.actividadesVidaDiaria || ""}
            rows={3}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, actividadesVidaDiaria: value }))
            }
          />
        </CCol>
      </CRow>
    );
  }

  if (section === "observaciones") {
    return (
      <CRow className="g-3">
        <CCol md={6}>
          <SipacTextarea
            id="observaciones"
            label="Observaciones"
            value={form.observaciones || ""}
            rows={5}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, observaciones: value }))
            }
          />
        </CCol>

        <CCol md={6}>
          <SipacTextarea
            id="objetivosTerapeuticos"
            label="Objetivos terapéuticos"
            value={form.objetivosTerapeuticos || ""}
            rows={5}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, objetivosTerapeuticos: value }))
            }
          />
        </CCol>
      </CRow>
    );
  }

  return (
    <CRow className="g-3">
      <CCol md={10}>
        <CFormLabel htmlFor="fechaAlta">Fecha de alta</CFormLabel>
        <CFormInput
          id="fechaAlta"
          value={formatFechaAlta(form.fechaAlta)}
          readOnly
        />
      </CCol>
      <CCol md={2} className="d-flex align-items-center justify-content-center">
        <CFormSwitch
          id="historiaActiva"
          label={form.activa ? "Activa" : "Inactiva"}
          checked={Boolean(form.activa)}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, activa: e.target.checked }))
          }
          className="sipac-switch"
        />
      </CCol>

      <CCol xs={12}>
        <SipacTextarea
          id="motivoConsulta"
          label="Motivo de consulta"
          value={form.motivoConsulta}
          required
          rows={3}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              motivoConsulta: value,
            }))
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
    </CRow>
  );
}
