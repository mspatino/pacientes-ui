import {
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
} from "@coreui/react";
import { BsJournalText } from "react-icons/bs";
import InfoList from "./InfoList";

interface Field {
  label: string;
  value: string;
}

interface Props {
  fields: Field[];
  // hasEstado: boolean;
  // activa?: boolean;
}

export default function HistoriaClinicaGeneralCard({
  fields,
  // hasEstado,
  // activa,
}: Props) {
  return (
    <CAccordionItem itemKey={1} className="hc-item">
<CAccordionHeader className="hc-header d-flex align-items-center">
 
    <span className="hc-title d-flex align-items-center gap-2">
      <BsJournalText />
      Datos clínicos generales
    </span>

    {/* {hasEstado && (
      <span
        className={`hc-badge ms-auto ${
          activa ? "hc-active" : "hc-inactive"
        }`}
      >
        {activa ? "Activa" : "Inactiva"}
      </span>
    )} */}
          {/* {hasEstado && (
            <div className="ms-auto">
              <span className="badge rounded-pill px-3 py-2 bg-success-subtle text-success">
                {activa ? "Activa" : "Inactiva"}
              </span>
            </div>
          )} */}
 
</CAccordionHeader>

      <CAccordionBody className="hc-body">
        <InfoList fields={fields} />
      </CAccordionBody>
    </CAccordionItem>
  );
}