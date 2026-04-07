import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CSpinner,
} from "@coreui/react";
import { getPacienteById, updatePaciente } from "../api/pacientes";
import type { PacienteResponseDTO } from "../api/pacientes";

const asRecord = (value: unknown): Record<string, unknown> =>
  (value as Record<string, unknown>) || {};

const firstString = (
  source: Record<string, unknown>,
  keys: string[],
): string | null => {
  for (const key of keys) {
    const val = source[key];
    if (typeof val === "string" && val.trim()) return val;
  }
  return null;
};

const toDateInputValue = (raw?: string | null): string => {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

type FormState = {
  apellido: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  email: string;
  direccion: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;
type SexoValue = "" | "Masculino" | "Femenino" | "Otro";
const SEXO_OPTIONS: SexoValue[] = ["", "Masculino", "Femenino", "Otro"];

const validateField = (name: keyof FormState, value: string): string => {
  const trimmed = value.trim();

  if (name === "nombre") {
    if (!trimmed) return "El nombre es obligatorio";
    return "";
  }

  if (name === "apellido") {
    if (!trimmed) return "El apellido es obligatorio";
    return "";
  }

  if (name === "dni") {
    if (!trimmed) return "El DNI es obligatorio";
    if (!/^\d{7,8}$/.test(trimmed)) return "El DNI debe tener 7 u 8 dígitos";
    return "";
  }

  if (name === "direccion") {
    if (trimmed.length > 255) return "La dirección es demasiado larga";
    return "";
  }

  if (name === "telefono") {
    if (trimmed && !/^[0-9+\-\s]{6,20}$/.test(trimmed)) return "Teléfono inválido";
    return "";
  }

  if (name === "sexo") {
    if (trimmed && !/^(Masculino|Femenino|Otro)$/.test(trimmed)) {
      return "Sexo inválido. Valores permitidos: Masculino, Femenino, Otro";
    }
    if (trimmed.length > 20) return "El sexo es demasiado largo";
    return "";
  }

  if (name === "email") {
    if (trimmed.length > 150) return "El email es demasiado largo";
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Email inválido";
    return "";
  }

  if (name === "fechaNacimiento") {
    if (!trimmed) return "La fecha de nacimiento es obligatoria";
    return "";
  }

  return "";
};

const validateForm = (form: FormState): FormErrors => {
  const fields = Object.keys(form) as Array<keyof FormState>;
  const errors: FormErrors = {};

  fields.forEach((field) => {
    const message = validateField(field, form[field]);
    if (message) errors[field] = message;
  });

  return errors;
};

export default function EditarPacientePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pacienteId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    apellido: "",
    nombre: "",
    dni: "",
    fechaNacimiento: "",
    sexo: "",
    telefono: "",
    email: "",
    direccion: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadPaciente = async () => {
      if (!pacienteId) {
        setLoading(false);
        setError("ID de paciente inválido.");
        return;
      }

      try {
        const data: PacienteResponseDTO = await getPacienteById(pacienteId);
        const source = asRecord(data);
        setForm({
          apellido: firstString(source, ["apellido"]) || "",
          nombre: firstString(source, ["nombre", "nombres"]) || "",
          dni: firstString(source, ["dni", "documento"]) || "",
          fechaNacimiento: toDateInputValue(
            firstString(source, ["fechaNacimiento", "fecha_nacimiento"]),
          ),
          sexo: SEXO_OPTIONS.includes(
            (firstString(source, ["sexo", "genero", "género"]) || "") as SexoValue,
          )
            ? (firstString(source, ["sexo", "genero", "género"]) as SexoValue)
            : "",
          telefono: firstString(source, ["telefono", "teléfono", "celular"]) || "",
          email: firstString(source, ["email", "correo"]) || "",
          direccion: firstString(source, ["direccion", "dirección", "domicilio"]) || "",
        });
      } catch (loadError) {
        console.error("No se pudo cargar el paciente", loadError);
        setError("No se pudo cargar el paciente.");
      } finally {
        setLoading(false);
      }
    };

    loadPaciente();
  }, [pacienteId]);

  const handleSave = async () => {
    if (!pacienteId) return;

    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Hay campos con errores. Revise el formulario.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await updatePaciente(pacienteId, {
        apellido: form.apellido,
        nombre: form.nombre,
        dni: form.dni,
        fechaNacimiento: form.fechaNacimiento || null,
        sexo: form.sexo || null,
        telefono: form.telefono || null,
        email: form.email || null,
        direccion: form.direccion || null,
      });
      navigate(`/pacientes/${pacienteId}`);
    } catch (saveError) {
      console.error("No se pudo guardar", saveError);
      setError("No se pudo guardar los cambios. Intente nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) || undefined }));
  };

  if (loading) {
    return (
      <div className="p-3 d-flex align-items-center gap-2 text-muted">
        <CSpinner size="sm" />
        Cargando paciente...
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 fw-bold mb-0">Editar paciente</h1>
        <CButton color="secondary" variant="outline" onClick={() => navigate(-1)}>
          Volver
        </CButton>
      </div>

      <CCard>
        <CCardBody>
          {error ? (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          ) : null}

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <CFormLabel>Apellido</CFormLabel>
              <CFormInput
                value={form.apellido}
                invalid={!!fieldErrors.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
              />
              {fieldErrors.apellido ? (
                <div className="text-danger small mt-1">{fieldErrors.apellido}</div>
              ) : null}
            </div>
            <div className="col-12 col-md-6">
              <CFormLabel>Nombre</CFormLabel>
              <CFormInput
                value={form.nombre}
                invalid={!!fieldErrors.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
              />
              {fieldErrors.nombre ? (
                <div className="text-danger small mt-1">{fieldErrors.nombre}</div>
              ) : null}
            </div>
            <div className="col-12 col-md-6">
              <CFormLabel>DNI</CFormLabel>
              <CFormInput
                value={form.dni}
                invalid={!!fieldErrors.dni}
                onChange={(e) => handleChange("dni", e.target.value)}
              />
              {fieldErrors.dni ? (
                <div className="text-danger small mt-1">{fieldErrors.dni}</div>
              ) : null}
            </div>
            <div className="col-12 col-md-6">
              <CFormLabel>Sexo</CFormLabel>
              <CFormSelect
                value={form.sexo}
                invalid={!!fieldErrors.sexo}
                onChange={(e) => handleChange("sexo", e.target.value)}
                options={[
                  { label: "Seleccione...", value: "" },
                  { label: "Masculino", value: "Masculino" },
                  { label: "Femenino", value: "Femenino" },
                  { label: "Otro", value: "Otro" },
                ]}
              />
              {fieldErrors.sexo ? (
                <div className="text-danger small mt-1">{fieldErrors.sexo}</div>
              ) : null}
            </div>
            <div className="col-12 col-md-6">
              <CFormLabel>Fecha de nacimiento</CFormLabel>
              <CFormInput
                type="date"
                value={form.fechaNacimiento}
                invalid={!!fieldErrors.fechaNacimiento}
                onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
              />
              {fieldErrors.fechaNacimiento ? (
                <div className="text-danger small mt-1">{fieldErrors.fechaNacimiento}</div>
              ) : null}
            </div>
            <div className="col-12 col-md-6">
              <CFormLabel>Teléfono</CFormLabel>
              <CFormInput
                value={form.telefono}
                invalid={!!fieldErrors.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
              />
              {fieldErrors.telefono ? (
                <div className="text-danger small mt-1">{fieldErrors.telefono}</div>
              ) : null}
            </div>
            <div className="col-12 col-md-6">
              <CFormLabel>Email</CFormLabel>
              <CFormInput
                value={form.email}
                invalid={!!fieldErrors.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {fieldErrors.email ? (
                <div className="text-danger small mt-1">{fieldErrors.email}</div>
              ) : null}
            </div>
            <div className="col-12 col-md-6">
              <CFormLabel>Dirección</CFormLabel>
              <CFormInput
                value={form.direccion}
                invalid={!!fieldErrors.direccion}
                onChange={(e) => handleChange("direccion", e.target.value)}
              />
              {fieldErrors.direccion ? (
                <div className="text-danger small mt-1">{fieldErrors.direccion}</div>
              ) : null}
            </div>
          </div>

          <div className="d-flex gap-2 mt-4">
            <CButton color="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </CButton>
            <CButton color="secondary" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
}
