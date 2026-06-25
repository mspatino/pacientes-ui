import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
// import Home from "../pages/Home";
import DashboardLayout from "../layout/DashboardLayout";
import PacientesPage from "../pages/paciente/PacientesPage";
import PacientePage from "../pages/paciente/Paciente";
import EditarPacientePage from "../pages/paciente/EditarPaciente";
import AltaPacientePage from "../pages/paciente/AltaPaciente";
import HistoriaClinicaPage from "../pages/historia_clinica/HistoriaClinicaPage";
import EditarHistoriaClinicaPage from "../pages/historia_clinica/EditarHistoriaClinicaPage";
//import DiagnosticosPacientePage from "../pages/DiagnosticosPacientePage";
import DiagnosticosPacientePage from "../pages/diagnostico/DiagnosticosPacientePage";
import DiagnosticoPage from "../pages/diagnostico/DiagnosticoPage";
import AgendaPage from "../pages/agenda/AgendaPage";
import NuevoTurnoPage from "../pages/agenda/NuevoTurnoPage";
import ConfiguracionPage from "../pages/ConfiguracionPage";

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
            <Route
              path="/pacientes/:id/historia-clinica/editar"
              element={<EditarHistoriaClinicaPage />}
            />
            <Route path="/pacientes/:id/diagnosticos" element={<DiagnosticosPacientePage />} />

            <Route path="/diagnostico" element={<DiagnosticoPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/agenda/nuevo" element={<NuevoTurnoPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/configuracion" element={<ConfiguracionPage />} />
            </Route>

            <Route path="/historia" element={<HistoriaClinicaPage />} />

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
