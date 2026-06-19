import {
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
} from "@coreui/react";
import { BsJournalText } from "react-icons/bs";
import type { HistoriaClinicaPayload } from "../../../api/pacientes";
import DatosClinicosForm from "./DatosClinicosForm";

interface DatosClinicosGeneralesCardProps {
  form: HistoriaClinicaPayload;
  setForm: React.Dispatch<React.SetStateAction<HistoriaClinicaPayload>>;
  section?: "consulta" | "antecedentes" | "observaciones";
  variant?: "accordion" | "panel";
}

export default function DatosClinicosGeneralesCard({
  form,
  setForm,
  section = "consulta",
  variant = "accordion",
}: DatosClinicosGeneralesCardProps) {
  if (variant === "panel") {
    return (
      <section className="sipac-hc-tab-section">
        <div className="hc-body">
          <DatosClinicosForm form={form} setForm={setForm} section={section} />
        </div>
      </section>
    );
  }

  return (
    <CAccordionItem itemKey={1} className="hc-item">
      <CAccordionHeader className="hc-header d-flex align-items-center">
        <span className="hc-title d-flex align-items-center gap-2">
          <BsJournalText />
          Datos clínicos generales
        </span>
      </CAccordionHeader>

      <CAccordionBody className="hc-body">
        <DatosClinicosForm form={form} setForm={setForm} section={section} />
      </CAccordionBody>
    </CAccordionItem>
  );
}
