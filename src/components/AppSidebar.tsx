import {
  CSidebar,
  CSidebarNav,
  CNavItem,
  CNavLink,
} from "@coreui/react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <CSidebar
      className="border-end"
      style={{
        width: collapsed ? "70px" : "220px",
        transition: "0.2s",
        position: "relative",
      }}
    >
      <div className="p-2 text-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ border: "none", background: "none" }}
        >
          ☰
        </button>
      </div>

      <CSidebarNav>

        <CNavItem>
          <CNavLink as={NavLink} to="/" end>
             {!collapsed && "Pacientes"}
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink as={NavLink} to="/historia">
             {!collapsed && "Historia Clinica"}
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink as={NavLink} to="/diagnostico">
             {!collapsed && "Diagnósticos"}
          </CNavLink>
        </CNavItem>

      </CSidebarNav>
    </CSidebar>
  );
}