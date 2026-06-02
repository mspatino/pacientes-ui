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
}

export default function DatosClinicosGeneralesCard({
  form,
  setForm,
}: DatosClinicosGeneralesCardProps) {
  return (
    <CAccordionItem itemKey={1} className="hc-item">
      <CAccordionHeader className="hc-header d-flex align-items-center">
        <span className="hc-title d-flex align-items-center gap-2">
          <BsJournalText />
          Datos clínicos generales
        </span>
      </CAccordionHeader>

      <CAccordionBody className="hc-body">
        <DatosClinicosForm form={form} setForm={setForm} />
      </CAccordionBody>
    </CAccordionItem>
  );
}
