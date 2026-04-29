interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  bordered?: boolean;
}

export default function InfoRow({
  label,
  value,
  bordered = true,
}: InfoRowProps) {
  return (
    <div
      className={`d-flex justify-content-between align-items-start gap-2 py-2 ${
        bordered ? "border-bottom" : ""
      }`}
    >
      <span className="text-muted small">{label}</span>

      <div className="fw-semibold text-end">
        {value}
      </div>
    </div>
  );
}