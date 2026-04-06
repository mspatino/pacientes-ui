import {
  CNavbar,
  CContainer,
  CNavbarBrand,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAvatar,
} from "@coreui/react";
import { useNavigate } from "react-router-dom";
import { BsBoxArrowRight } from "react-icons/bs";

export default function AppNavbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Usuario";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <CNavbar
      className="bg-white border-bottom px-3"
      style={{ height: "70px", minHeight: "70px", zIndex: 1040 }}
    >
      <CContainer fluid className="d-flex justify-content-between align-items-center px-4">

        {/* 🔵 IZQUIERDA */}
        {/* <CNavbarBrand className="d-flex align-items-center gap-2">
          <img src="/logo.png" style={{ width: 32 }} />

          <div>
            <strong>SIPAC</strong>
            <div style={{ fontSize: 11, color: "#666" }}>
              v1.0.0
            </div>
          </div>
        </CNavbarBrand> */}
        <CNavbarBrand className="d-flex align-items-center gap-2">
  <img src="/logo.png" style={{ width: 32 }} />

  <div className="d-flex align-items-center gap-2">
    <strong style={{ color: "#2F6FB3" }}>SIPAC</strong>
    <small className="text-muted" style={{ fontSize: "12px" }}>
      v1.0.0
    </small>
  </div>
</CNavbarBrand>

        {/* 🔵 DERECHA (dropdown usuario) */}
        <CDropdown alignment="end">
          <CDropdownToggle
            color="light"
            className="d-flex align-items-center gap-2 border-0 px-3"
            style={{
                padding: "6px 12px",
                borderRadius: "8px"


            }}
          >
            <CAvatar color="primary" textColor="white">
              {username[0]?.toUpperCase()}
            </CAvatar>
            <span className="fw-semibold">{username}</span>
          </CDropdownToggle>

          <CDropdownMenu>
            <CDropdownItem onClick={logout}  className="d-flex align-items-center gap-2 text-danger">
               <BsBoxArrowRight style={{ color: "#dc3545" }}/>
              Cerrar sesión
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>

      </CContainer>
    </CNavbar>
  );
}