interface Field {
  label: string;
  value: string;
}

interface InfoListProps {
  fields: Field[];
  emptyText?: string;
}

export default function InfoList({
  fields,
  emptyText = "Sin datos registrados.",
}: InfoListProps) {
  if (fields.length === 0) {
    return <div className="hc-empty">{emptyText}</div>;
  }

  return (
    <div className="hc-grid">
      {fields.map((field) => (
        <div key={field.label} className="hc-row">
          <div className="hc-label">{field.label}</div>
          <div className="hc-value">{field.value}</div>
        </div>
      ))}
    </div>
  );
}
