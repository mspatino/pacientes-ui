import { Outlet } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import AppNavbar from "../components/AppNavbar";

export default function DashboardLayout() {
  return (
    <div className="d-flex flex-column vh-100">

      {/* NAVBAR */}
      <AppNavbar />

      {/* BODY */}
      <div className="d-flex flex-grow-1 overflow-hidden">

        {/* SIDEBAR */}
        <AppSidebar />

        {/* CONTENT */}
        <main className="flex-grow-1 p-3 bg-light overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}