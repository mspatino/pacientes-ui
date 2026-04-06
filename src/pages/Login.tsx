import { useState , useEffect } from "react";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CInputGroup,
  CFormInput,
  CButton,
  CAlert,
  CInputGroupText,
} from "@coreui/react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";



export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  console.log("API URL:", import.meta.env.VITE_API_URL);

  const navigate = useNavigate();

 useEffect(() => {
  const token = localStorage.getItem("accessToken");

  // solo redirigir si realmente estás logueado
  if (token && token !== "undefined") {
    navigate("/", { replace: true });
  }
});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError("");

      //  limpiar tokens previos
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

    try {

      const res = await axiosInstance.post("/auth/login",
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
    //  catch {
    //   setError("Usuario o contraseña incorrectos");
    // }
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={4}>
            <CCard>
              <CCardBody>
                <CForm onSubmit={handleLogin} autoComplete="off">
                  
                    <div className="mb-4 d-flex align-items-center">
                      <img
                        src="/logo.png"
                        alt="SIPAC"
                        style={{ width: 70, marginRight: 10 }}
                      />

                      <div>
                        <h3 className="mb-0">SIPAC</h3>
                        <small className="text-muted">
                          Sistema Integral de Pacientes
                        </small>
                      </div>
                    </div>

                  {error && (
                      <CAlert color="primary" className="sipac-alert">
                        {error}
                      </CAlert>
                    )}

                  <CInputGroup className="mb-3">
                    {/* <CInputGroupText>👤</CInputGroupText> */}
                    <CFormInput
                      placeholder="Usuario"
                      value={username}
                      autoComplete="off"
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    {/* <CInputGroupText>🔒</CInputGroupText> */}
                    <CFormInput
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password" 
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <CInputGroupText 
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </CInputGroupText>
                  </CInputGroup>

                  {/* <CButton type="submit" color="primary" className="w-100">
                    Ingresar
                  </CButton> */}

                  <CButton
                    type="submit"
                    color="primary"
                    className="w-100"
                    disabled={!username || !password}>
                    Ingresar
                  </CButton>

                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}