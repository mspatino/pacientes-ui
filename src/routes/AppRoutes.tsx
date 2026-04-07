import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
// import Home from "../pages/Home";
import DashboardLayout from "../layout/DashboardLayout";
import PacientesPage from "../pages/PacientesPage";
import PacientePage from "../pages/Paciente";
import EditarPacientePage from "../pages/EditarPaciente";

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
            <Route path="/pacientes/:id" element={<PacientePage />} />
            <Route path="/pacientes/:id/editar" element={<EditarPacientePage />} />

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
