import type { HistoriaClinicaPayload } from "../../../api/pacientes";
import SectionCard from "../shared/SectionCard";
import DatosClinicosForm from "./DatosClinicosForm";

interface DatosClinicosGeneralesCardProps {
  form: HistoriaClinicaPayload;
  setForm: React.Dispatch<React.SetStateAction<HistoriaClinicaPayload>>;
}

export default function DatosClinicosGeneralesCard({
  form,
  setForm,
}: DatosClinicosGeneralesCardProps) {
  return (
    <SectionCard title="Datos clínicos generales">
      <DatosClinicosForm form={form} setForm={setForm} />
    </SectionCard>
  );
}
