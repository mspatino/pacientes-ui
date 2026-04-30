import {
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
} from "@coreui/react";
import { BsJournalText } from "react-icons/bs";

interface Field {
  label: string;
  value: string;
}

interface HistoriaClinicaGeneralCardProps {
  fields: Field[];
  hasEstado: boolean;
  activa?: boolean;
}

export default function HistoriaClinicaGeneralCard({
  fields,
  
}: HistoriaClinicaGeneralCardProps) {
  return (
    <CAccordionItem itemKey={1}>
<CAccordionHeader className="p-0">
  <div className="d-flex w-100 align-items-center gap-3 justify-content-between p-3">
    <span className="d-flex align-items-center gap-2">
      <BsJournalText />
      Datos clínicos generales
    </span>

    {/* {hasEstado && (
      <span
        className={`badge rounded-pill px-3 py-2 ${
          activa
            ? "bg-success-subtle text-success"
            : "bg-danger-subtle text-danger"
        }`}
      >
        {activa ? "Activa" : "Inactiva"}
      </span>
    )} */}
  </div>
</CAccordionHeader>

      <CAccordionBody>
        <div className="d-flex flex-column gap-3">
  

          {fields.length === 0 ? (
            <div className="small text-muted">
              No hay datos clínicos cargados para mostrar.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {fields.map((field) => (
                <div
                  key={field.label}
                  className="border-bottom pb-2"
                >
                  <div className="small text-muted">
                    {field.label}
                  </div>

                  <div className="fw-semibold">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CAccordionBody>
    </CAccordionItem>
  );
}