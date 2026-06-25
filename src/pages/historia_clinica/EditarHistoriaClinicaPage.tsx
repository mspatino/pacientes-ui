import { useLocation, useNavigate, useParams } from "react-router-dom";
import HistoriaClinicaContainer from "./HistoriaClinicaContainer";

interface HistoriaLocationState {
  mode?: "create";
  activeTab?: "consulta" | "antecedentes" | "observaciones" | "evaluaciones" | "diagnosticos";
}

export default function EditarHistoriaClinicaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as HistoriaLocationState) || {};

  return (
    <HistoriaClinicaContainer
      patientId={id}
      mode={state.mode}
      initialTab={state.activeTab}
      onBack={() => navigate(-1)}
      onSaved={(patientId) =>
        navigate(`/pacientes/${patientId}/historia-clinica`, {
          state: { activeTab: state.activeTab },
        })
      }
    />
  );
}
