import {
  CSidebar,
  CSidebarNav,
  CNavItem,
  CNavLink,
} from "@coreui/react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/auth";

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setIsAdmin(false);
      return;
    }

    let mounted = true;

    getCurrentUser()
      .then((user) => {
        if (mounted) {
          setIsAdmin(user.admin);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsAdmin(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

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
          <CNavLink as={NavLink} to="/agenda">
             {!collapsed && "Agenda"}
          </CNavLink>
        </CNavItem>

        {isAdmin && (
          <CNavItem>
            <CNavLink as={NavLink} to="/configuracion">
              {!collapsed && "Configuración"}
            </CNavLink>
          </CNavItem>
        )}

      </CSidebarNav>
    </CSidebar>
  );
}
