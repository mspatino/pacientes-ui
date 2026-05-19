import { CFormInput, CFormLabel } from "@coreui/react";
import type { ComponentProps } from "react";

type BaseInputProps = Omit<
  ComponentProps<typeof CFormInput>,
  "type" | "value" | "onChange"
>;

interface SipacDateInputProps extends BaseInputProps {
  label: string;
  value: string;
  invalid?: boolean;
  onValueChange: (value: string) => void;
}

export default function SipacDateInput({
  label,
  value,
  invalid,
  onValueChange,
  ...rest
}: SipacDateInputProps) {
  return (
    <>
      <CFormLabel>{label}</CFormLabel>
      <CFormInput
        {...rest}
        type="date"
        value={value}
        invalid={invalid}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </>
  );
}

