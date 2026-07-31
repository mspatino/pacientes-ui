import { useEffect, useState } from "react";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CFormLabel,
  CAlert,
} from "@coreui/react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";



export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token && token !== "undefined") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError("");

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    try {

      const res = await axiosInstance.post("/api/auth/login",
        {
          username,
          password,
        }
      );

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("username", username);

      navigate("/");
    }
    catch (err: unknown) {
      console.log("ERROR LOGIN:", err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setError("Usuario o contraseña incorrectos");
        } else {
          setError(
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Error del servidor"
          );
        }
      } else {
        setError("Error inesperado");
      }
    }
  };

  return (
    <div className="sipac-login-page min-vh-100 d-flex align-items-center justify-content-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol sm={10} md={7} lg={5} xl={4}>
            <CCard className="sipac-login-card border-0">
              <CCardBody>
                <CForm onSubmit={handleLogin} autoComplete="off">
                  <div className="sipac-login-brand">
                    <img
                      src="/logo.png"
                      alt="SIPAC"
                      className="sipac-login-logo"
                    />

                    <div>
                      <h1 className="sipac-login-title">SIPAC</h1>
                      <div className="sipac-login-subtitle">
                        Sistema Integral de Pacientes
                      </div>
                    </div>
                  </div>

                  {error && (
                    <CAlert color="primary" className="sipac-alert">
                      {error}
                    </CAlert>
                  )}

                  <div className="sipac-field-block mb-3">
                    <CFormLabel className="sipac-label">Usuario</CFormLabel>
                    <CFormInput
                      className="sipac-input"
                      placeholder="Usuario"
                      value={username}
                      autoComplete="off"
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div className="sipac-field-block mb-2">
                    <CFormLabel className="sipac-label">Contraseña</CFormLabel>
                    <div className="sipac-password-field">
                      <CFormInput
                        className="sipac-input sipac-password-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />

                      <button
                        type="button"
                        className="sipac-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="sipac-login-forgot">
                    <Link to="/recuperar-contrasena">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="sipac-login-submit w-100"
                    disabled={!username || !password}
                  >
                    Ingresar
                  </button>

                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}
