import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
} from "@coreui/react";
import { BsJournalText } from "react-icons/bs";
import InfoRow from "./InfoRow";

interface Field {
  label: string;
  value: string;
}

interface PacienteDatosCardProps {
  identificacionContactoFields: Field[];
  estadoConvivenciaFields: Field[];
  nivelEducativo: string;
  convivientes: string[];
  formatConviviente: (value: string) => string;
}

export default function PacienteDatosCard({
  identificacionContactoFields,
  estadoConvivenciaFields,
  nivelEducativo,
  convivientes,
  formatConviviente,
}: PacienteDatosCardProps) {
  return (
    <CAccordion
      activeItemKey={1}
      alwaysOpen
      className="paciente-accordion w-100"
    >
      <CAccordionItem itemKey={1}>
        <CAccordionHeader>
          <span className="d-inline-flex align-items-center gap-2">
            <span className="paciente-accordion-icon">
              <BsJournalText />
            </span>

            Datos del paciente
          </span>
        </CAccordionHeader>

        <CAccordionBody>
          <div className="row g-3">

            {/* DATOS PERSONALES */}
            <div className="col-12 col-lg-6">
              <div className="paciente-section-card">

                {identificacionContactoFields.map((field) => (
                  <InfoRow
                    key={field.label}
                    label={field.label}
                    value={field.value}
                  />
                ))}

              </div>
            </div>

            {/* DATOS COMPLEMENTARIOS */}
            <div className="col-12 col-lg-6">
              <div className="paciente-section-card">

                {estadoConvivenciaFields.map((field) => (
                  <InfoRow
                    key={field.label}
                    label={field.label}
                    value={field.value}
                  />
                ))}

                <InfoRow
                  label="Nivel educativo"
                  value={
                    nivelEducativo !== "-" ? (
                      <span className="paciente-chip">
                        {nivelEducativo}
                      </span>
                    ) : (
                      "-"
                    )
                  }
                />

                <InfoRow
                  bordered={false}
                  label="Convivientes"
                  value={
                    convivientes.length > 0 ? (
                      <div className="d-flex flex-wrap justify-content-end gap-2">
                        {convivientes.map((conviviente) => (
                          <span
                            key={conviviente}
                            className="paciente-chip"
                          >
                            {formatConviviente(conviviente)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )
                  }
                />

              </div>
            </div>

          </div>
        </CAccordionBody>
      </CAccordionItem>
    </CAccordion>
  );
}