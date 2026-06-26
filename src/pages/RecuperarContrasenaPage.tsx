import { useState, type FormEvent } from "react";
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
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || "No se pudo generar la recuperación";
  }

  return "No se pudo generar la recuperación";
};

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResetUrl(null);

    try {
      const response = await requestPasswordReset(email.trim());
      setMessage(response.message);
      setResetUrl(response.resetUrl || null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
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
                      <div className="sipac-login-subtitle">Recuperar contraseña</div>
                    </div>
                  </div>

                  {error && <CAlert color="primary" className="sipac-alert">{error}</CAlert>}
                  {message && <CAlert color="success" className="sipac-alert">{message}</CAlert>}

                  <div className="sipac-field-block mb-3">
                    <CFormLabel className="sipac-label">Email</CFormLabel>
                    <CFormInput
                      className="sipac-input"
                      type="email"
                      placeholder="usuario@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>

                  {resetUrl && (
                    <div className="sipac-reset-dev-link">
                      <span>Link generado:</span>
                      <a href={resetUrl}>{resetUrl}</a>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="sipac-login-submit w-100"
                    disabled={!email.trim() || loading}
                  >
                    Enviar recuperación
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
