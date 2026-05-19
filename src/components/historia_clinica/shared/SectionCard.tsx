import type { ReactNode } from "react";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";

interface SectionCardProps {
  title: ReactNode;
  children: ReactNode;
  headerAction?: ReactNode;
}

export default function SectionCard({
  title,
  children,
  headerAction,
}: SectionCardProps) {
  return (
    <CCard className="sipac-form-card">
      <CCardHeader>
        {headerAction ? (
          <div className="d-flex justify-content-between align-items-center gap-2">
            <span>{title}</span>
            {headerAction}
          </div>
        ) : (
          title
        )}
      </CCardHeader>
      <CCardBody>{children}</CCardBody>
    </CCard>
  );
}
