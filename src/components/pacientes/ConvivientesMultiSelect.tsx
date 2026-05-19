import { CFormCheck, CFormLabel } from "@coreui/react";
import { useMemo, useState } from "react";
import { CONVIVIENTE_OPTIONS } from "../../constants/convivientes";

const formatConviviente = (value: string): string =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

interface ConvivientesMultiSelectProps {
  label: string;
  options?: string[];
  selected: string[];
  onChange: (nextValues: string[]) => void;
  className?: string;
}

export default function ConvivientesMultiSelect({
  label,
  options = CONVIVIENTE_OPTIONS,
  selected,
  onChange,
  className,
}: ConvivientesMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleOption = (value: string, checked: boolean) => {
    if (checked) {
      onChange(selectedSet.has(value) ? selected : [...selected, value]);
      return;
    }
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <div className={["position-relative", className].filter(Boolean).join(" ")}>
      {label?.trim() && <CFormLabel className="mb-1">{label}</CFormLabel>}
      <div
        role="button"
        tabIndex={0}
        className="form-control text-start d-flex align-items-start justify-content-between gap-2 py-2 conviviente-selector"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
      >
        <span className="d-flex flex-column gap-1 w-100">
          <span className="conviviente-selected-zone d-flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((value) => (
                <span
                  key={value}
                  className="paciente-conviviente-chip d-inline-flex align-items-center gap-1"
                >
                  {formatConviviente(value)}
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0 lh-1"
                    style={{ color: "inherit" }}
                    aria-label={`Quitar ${formatConviviente(value)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleOption(value, false);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-muted">Sin convivientes seleccionados</span>
            )}
          </span>
          <span className="conviviente-pick-zone" />
        </span>
        <span style={{ fontSize: "0.75rem", marginTop: "0.2rem" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open ? (
        <div
          className="position-absolute z-3 w-100 border rounded bg-white p-1 mt-1"
          style={{ maxHeight: "360px", overflowY: "auto" }}
        >
          <div className="row g-0">
            {options.map((option) => (
              <div key={option} className="col-12 col-sm-6 col-md-4">
                <CFormCheck
                  className="mb-0 conviviente-option-check"
                  type="checkbox"
                  id={`conviviente-option-${option}`}
                  label={formatConviviente(option)}
                  checked={selectedSet.has(option)}
                  onChange={(e) => {
                    toggleOption(option, e.target.checked);
                    setOpen(false);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
