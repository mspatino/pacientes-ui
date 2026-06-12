import type { ReactNode } from "react";
import { FaArrowLeft } from "react-icons/fa";

interface PacienteFormHeaderProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onBack: () => void;
  actions?: ReactNode;
}

export default function PacienteFormHeader({
  title,
  subtitle,
  icon,
  onBack,
  actions,
}: PacienteFormHeaderProps) {
  return (
    <div className="sipac-page-header">

      {/* LEFT */}
      <div className="d-flex align-items-center gap-3">

        <div className="sipac-header-icon">
          {icon}
        </div>

        <div>
          <h3 className="hc-title mb-0">
            {title}
          </h3>

          <div className="text-muted small">
            {subtitle}
          </div>
        </div>

      </div>

      {/* RIGHT TOOLBAR */}
      <div className="sipac-header-actions">
        {actions ?? (
          <button
            type="button"
            className="sipac-toolbar-btn"
            onClick={onBack}
          >
            <FaArrowLeft />
            Volver
          </button>
        )}

      </div>

    </div>
  );
}
