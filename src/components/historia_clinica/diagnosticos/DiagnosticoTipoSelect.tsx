import { CFormLabel } from "@coreui/react";
import type { TipoDiagnostico } from "../../../api/pacientes";
import {
  getDiagnosticoTipoBadgeStyle,
  normalizeTipoDiagnostico,
} from "./diagnosticoUtils";

interface Props {
  value?: TipoDiagnostico;
  onChange: (value: TipoDiagnostico) => void;
  className?: string;
}

const options = [
  {
    value: "PRINCIPAL",
    label: "Principal",
  },
  {
    value: "SECUNDARIO",
    label: "Secundario",
  },
  {
    value: "SINTOMA",
    label: "Síntoma",
  },
  {
    value: "FACTOR_PSICOSOCIAL",
    label: "Factor psicosocial",
  },
  {
    value: "EVENTO_RIESGO",
    label: "Evento de riesgo",
  },
];

export default function DiagnosticoTipoSelect({
  value,
  onChange,
  className = "col-md-6",
}: Props) {
  const normalizedValue = normalizeTipoDiagnostico(value);
  const selectedStyle = getDiagnosticoTipoBadgeStyle(normalizedValue);

  return (
    <div className={className}>
      <CFormLabel className="sipac-label">
        Tipo diagnóstico
      </CFormLabel>

      <select
        className="form-select sipac-select"
        value={normalizedValue}
        onChange={(e) => onChange(e.target.value as TipoDiagnostico)}
        style={{
          backgroundColor: selectedStyle.backgroundColor,
          color: selectedStyle.color,
          border: selectedStyle.border,
          boxShadow: "none",
        }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
