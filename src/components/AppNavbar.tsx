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

        <CNavbarBrand className="d-flex align-items-center gap-2">
          <img src="/logo.png" style={{ width: 32 }} />

          <div className="d-flex align-items-center gap-2">
            <strong style={{ color: "#2F6FB3" }}>SIPAC</strong>
            <small className="text-muted" style={{ fontSize: "12px" }}>
              v1.0.0
            </small>
          </div>
        </CNavbarBrand>

        <CDropdown alignment="end">
          <CDropdownToggle
            color="light"
            className="sipac-user-toggle d-flex align-items-center gap-2"
          >
            <CAvatar className="sipac-user-avatar">
              {username[0]?.toUpperCase()}
            </CAvatar>
            <span className="sipac-user-name">{username}</span>
          </CDropdownToggle>

          <CDropdownMenu className="sipac-user-menu">
            <CDropdownItem
              onClick={logout}
              className="sipac-user-menu-item d-flex align-items-center gap-2"
            >
              <BsBoxArrowRight />
              Cerrar sesión
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>

      </CContainer>
    </CNavbar>
  );
}
