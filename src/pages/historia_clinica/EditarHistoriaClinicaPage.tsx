import { useLocation, useNavigate, useParams } from "react-router-dom";
import HistoriaClinicaContainer from "./HistoriaClinicaContainer";

interface HistoriaLocationState {
  mode?: "create";
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
      onBack={() => navigate(-1)}
      onSaved={(patientId) =>
        navigate(`/pacientes/${patientId}/historia-clinica`)
      }
    />
  );
}
