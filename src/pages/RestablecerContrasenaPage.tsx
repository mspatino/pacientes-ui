import { useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import {
  CAlert,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
} from "@coreui/react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || "No se pudo restablecer la contraseña";
  }

  return "No se pudo restablecer la contraseña";
};

export default function RestablecerContrasenaPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setMessage("Contraseña actualizada. Ya podés ingresar con tu nueva contraseña.");
      setPassword("");
      setConfirmPassword("");
    } catch (resetError) {
      setError(getErrorMessage(resetError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sipac-login-page min-vh-100 d-flex align-items-center justify-content-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol sm={10} md={7} lg={5} xl={4}>
            <CCard className="sipac-login-card border-0">
              <CCardBody>
                <CForm onSubmit={handleSubmit} autoComplete="off">
                  <div className="sipac-login-brand">
                    <img src="/logo.png" alt="SIPAC" className="sipac-login-logo" />
                    <div>
                      <h1 className="sipac-login-title">SIPAC</h1>
                      <div className="sipac-login-subtitle">Nueva contraseña</div>
                    </div>
                  </div>

                  {!token && (
                    <CAlert color="primary" className="sipac-alert">
                      El enlace de recuperación no tiene token.
                    </CAlert>
                  )}
                  {error && <CAlert color="primary" className="sipac-alert">{error}</CAlert>}
                  {message && <CAlert color="success" className="sipac-alert">{message}</CAlert>}

                  <div className="sipac-field-block mb-3">
                    <CFormLabel className="sipac-label">Nueva contraseña</CFormLabel>
                    <CFormInput
                      className="sipac-input"
                      type="password"
                      value={password}
                      minLength={6}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div className="sipac-field-block mb-4">
                    <CFormLabel className="sipac-label">Confirmar contraseña</CFormLabel>
                    <CFormInput
                      className="sipac-input"
                      type="password"
                      value={confirmPassword}
                      minLength={6}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="sipac-login-submit w-100"
                    disabled={!token || !password || !confirmPassword || loading}
                  >
                    Actualizar contraseña
                  </button>

                  <div className="sipac-login-secondary-action">
                    <Link to="/login">Volver al ingreso</Link>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}
