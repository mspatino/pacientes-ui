import { useEffect, useRef } from "react";
import {
  CFormLabel,
  CFormTextarea,
} from "@coreui/react";

interface SipacTextareaProps {
  id: string;
  label: string;
  value: string;
  required?: boolean;
  rows?: number;
  onChange: (value: string) => void;
}

const autoResize = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

export default function SipacTextarea({
  id,
  label,
  value,
  required,
  rows = 2,
  onChange,
}: SipacTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [value]);

  return (
    <>
      <CFormLabel
        className="sipac-label"
        htmlFor={id}
      >
        {label}
      </CFormLabel>

      <CFormTextarea
        ref={textareaRef}
        id={id}
        className="sipac-input"
        value={value}
        rows={rows}
        required={required}
        style={{
          resize: "none",
          overflow: "hidden",
          minHeight: `${rows * 24 + 16}px`,
        }}
        onInput={(e) => autoResize(e.currentTarget)}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  );
}