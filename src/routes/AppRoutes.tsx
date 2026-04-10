import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
// import Home from "../pages/Home";
import DashboardLayout from "../layout/DashboardLayout";
import PacientesPage from "../pages/paciente/PacientesPage";
import PacientePage from "../pages/paciente/Paciente";
import EditarPacientePage from "../pages/paciente/EditarPaciente";
import AltaPacientePage from "../pages/paciente/AltaPaciente";
import HistoriaClinicaPage from "../pages/HistoriaClinicaPage";
import DiagnosticoPage from "../pages/diagnostico/DiagnosticoPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* publico */}
        <Route path="/login" element={<Login />} />

         {/* Privadas */}
        <Route element={<PrivateRoute />}>

          {/* layout principal */}
          <Route element={<DashboardLayout />}>

                    {/* default */}
            <Route path="/" element={<PacientesPage />} />
            <Route path="/pacientes/nuevo" element={<AltaPacientePage />} />
            <Route path="/pacientes/:id" element={<PacientePage />} />
            <Route path="/pacientes/:id/editar" element={<EditarPacientePage />} />
            <Route path="/pacientes/:id/historia-clinica" element={<HistoriaClinicaPage />} />

            <Route path="/diagnostico" element={<DiagnosticoPage />} />

            {/* futuras rutas */}
            {/* <Route path="/patients" element={<PatientsPage />} /> */}

          {/* <Route path="/" element={<Home />} /> */}
          </Route>
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}
