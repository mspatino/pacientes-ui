import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CAlert,
  CCard,
  CCardBody,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CSpinner,
} from "@coreui/react";
import axios from "axios";
import {
  createPaciente,
  getPacienteById,
  updatePaciente,
  type PacienteResponseDTO,
} from "../../api/pacientes";
import ConvivientesMultiSelect from "./ConvivientesMultiSelect";
import SipacDateInput from "../SipacDateInput";
import { CONVIVIENTE_OPTIONS } from "../../constants/convivientes";
import { asRecord, firstString } from "../../utils/pacienteFormatters";
import PacienteFormHeader from "./PacienteFormHeader";
import { FaUserEdit, FaUserPlus } from "react-icons/fa";

type Mode = "create" | "edit";

interface PacienteFormProps {
  mode: Mode;
}

type FormState = {
  apellido: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  ocupacion: string;
  sexo: string;
  estadoCivil: string;
  nivelEducativo: string;
  convivientes: string[];
  telefono: string;
  email: string;
  direccion: string;
};

type EditableField = Exclude<keyof FormState, "convivientes">;
type FormErrors = Partial<Record<EditableField | "convivientes", string>>;
type SexoValue = "" | "Masculino" | "Femenino" | "Otro";
const SEXO_OPTIONS: SexoValue[] = ["", "Masculino", "Femenino", "Otro"];
type EstadoCivilValue =
  | ""
  | "SOLTERO"
  | "CASADO"
  | "DIVORCIADO"
  | "VIUDO"
  | "UNION_CONVIVENCIAL";
const ESTADO_CIVIL_OPTIONS: EstadoCivilValue[] = [
  "",
  "SOLTERO",
  "CASADO",
  "DIVORCIADO",
  "VIUDO",
  "UNION_CONVIVENCIAL",
];
type NivelEducativoValue =
  | ""
  | "PRIMARIO"
  | "SECUNDARIO"
  | "TERCIARIO"
  | "UNIVERSITARIO"
  | "OTRO"
  | "SIN_ESCOLARIDAD";

const NIVEL_EDUCATIVO_OPTIONS: NivelEducativoValue[] = [
  "",
  "PRIMARIO",
  "SECUNDARIO",
  "TERCIARIO",
  "UNIVERSITARIO",
  "OTRO",
  "SIN_ESCOLARIDAD",
];

const firstStringArray = (
  source: Record<string, unknown>,
  keys: string[],
): string[] => {
  for (const key of keys) {
    const val = source[key];
    if (Array.isArray(val)) {
      return val.filter((item): item is string => typeof item === "string");
    }
  }
  return [];
};

const toDateInputValue = (raw?: string | null): string => {
  if (!raw) return "";
  const trimmed = raw.trim();
  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/);
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const normalizeConviviente = (value: string): string => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (normalized === "madre" || normalized === "padre") return "padres";
  if (normalized === "otro_familiar") return "otros_familiares";
  return normalized;
};

const normalizeEstadoCivil = (value: string): EstadoCivilValue => {
  if (!value) return "";
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (ESTADO_CIVIL_OPTIONS.includes(normalized as EstadoCivilValue)) {
    return normalized as EstadoCivilValue;
  }
  return "";
};

const normalizeNivelEducativo = (value: string): NivelEducativoValue => {
  if (!value) return "";
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (normalized === "SIN_ESCOLARIDAD") return "SIN_ESCOLARIDAD";
  if (normalized === "PRIMARIA") return "PRIMARIO";
  if (normalized === "SECUNDARIA") return "SECUNDARIO";
  if (NIVEL_EDUCATIVO_OPTIONS.includes(normalized as NivelEducativoValue)) {
    return normalized as NivelEducativoValue;
  }
  return "";
};

const validateField = (name: EditableField, value: string): string => {
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
  if (name === "ocupacion") {
    if (trimmed.length > 100) return "La ocupación es demasiado larga";
    return "";
  }
  if (name === "telefono") {
    if (!trimmed) return "El teléfono es obligatorio";
    if (trimmed && !/^[0-9+\-\s]{6,20}$/.test(trimmed))
      return "Teléfono inválido";
    return "";
  }
  if (name === "sexo") {
    if (!trimmed) return "El sexo es obligatorio";
    if (!/^(Masculino|Femenino|Otro)$/.test(trimmed)) {
      return "Sexo inválido. Valores permitidos: Masculino, Femenino, Otro";
    }
    return "";
  }
  if (name === "estadoCivil") {
    if (!trimmed) return "El estado civil es obligatorio";
    return "";
  }
  if (name === "nivelEducativo") {
    if (!trimmed) return "El nivel educativo es obligatorio";
    return "";
  }
  if (name === "email") {
    if (trimmed.length > 150) return "El email es demasiado largo";
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return "Email inválido";
    return "";
  }
  if (name === "fechaNacimiento") {
    if (!trimmed) return "La fecha de nacimiento es obligatoria";
    return "";
  }
  return "";
};

const validateForm = (form: FormState): FormErrors => {
  const fields: EditableField[] = [
    "apellido",
    "nombre",
    "dni",
    "fechaNacimiento",
    "ocupacion",
    "sexo",
    "estadoCivil",
    "nivelEducativo",
    "telefono",
    "email",
    "direccion",
  ];
  const errors: FormErrors = {};

  fields.forEach((field) => {
    const message = validateField(field, form[field]);
    if (message) errors[field] = message;
  });

  if (form.convivientes.length === 0) {
    errors.convivientes = "Seleccione al menos un conviviente";
  }

  return errors;
};

export default function PacienteForm({ mode }: PacienteFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const pacienteId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  const isEditMode = mode === "edit";

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormState>({
    apellido: "",
    nombre: "",
    dni: "",
    fechaNacimiento: "",
    ocupacion: "",
    sexo: "",
    estadoCivil: "",
    nivelEducativo: "",
    convivientes: [],
    telefono: "",
    email: "",
    direccion: "",
  });

  useEffect(() => {
    if (!isEditMode) return;

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
            (firstString(source, ["sexo", "genero", "género"]) ||
              "") as SexoValue,
          )
            ? (firstString(source, ["sexo", "genero", "género"]) as SexoValue)
            : "",
          estadoCivil: normalizeEstadoCivil(
            firstString(source, [
              "estadoCivil",
              "estado_civil",
              "civilStatus",
            ]) || "",
          ),
          nivelEducativo: normalizeNivelEducativo(
            firstString(source, ["nivelEducativo", "nivel_educativo"]) || "",
          ),
          convivientes: firstStringArray(source, ["convivientes"])
            .map(normalizeConviviente)
            .filter((value) => CONVIVIENTE_OPTIONS.includes(value)),
          ocupacion: firstString(source, ["ocupacion", "ocupación"]) || "",
          telefono:
            firstString(source, ["telefono", "teléfono", "celular"]) || "",
          email: firstString(source, ["email", "correo"]) || "",
          direccion:
            firstString(source, ["direccion", "dirección", "domicilio"]) || "",
        });
      } catch (loadError) {
        console.error("No se pudo cargar el paciente", loadError);
        setError("No se pudo cargar el paciente.");
      } finally {
        setLoading(false);
      }
    };

    loadPaciente();
  }, [isEditMode, pacienteId]);

  const handleChange = (name: EditableField, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value) || undefined,
    }));
  };

  const handleSave = async () => {
    if (isEditMode && !pacienteId) return;

    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Hay campos con errores. Revise el formulario.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (isEditMode && pacienteId) {
        await updatePaciente(pacienteId, {
          apellido: form.apellido,
          nombre: form.nombre,
          dni: form.dni,
          fechaNacimiento: form.fechaNacimiento || null,
          sexo: form.sexo || null,
          estadoCivil: form.estadoCivil || null,
          nivelEducativo: form.nivelEducativo || null,
          convivientes: form.convivientes,
          ocupacion: form.ocupacion || null,
          telefono: form.telefono || null,
          email: form.email || null,
          direccion: form.direccion || null,
        });
        navigate(`/pacientes/${pacienteId}`);
        return;
      }

      const payload: Record<string, unknown> = {
        apellido: form.apellido.trim(),
        nombre: form.nombre.trim(),
        dni: form.dni.trim(),
        fechaNacimiento: form.fechaNacimiento,
        sexo: form.sexo,
        estadoCivil: form.estadoCivil,
        nivelEducativo: form.nivelEducativo,
        convivientes: form.convivientes,
      };

      const telefono = form.telefono.trim();
      const email = form.email.trim();
      const direccion = form.direccion.trim();
      const ocupacion = form.ocupacion.trim();

      if (telefono) payload.telefono = telefono;
      if (email) payload.email = email;
      if (direccion) payload.direccion = direccion;
      if (ocupacion) payload.ocupacion = ocupacion;

      const created = await createPaciente(payload);
      if (created?.id) {
        navigate(`/pacientes/${created.id}`);
      } else {
        navigate("/");
      }
    } catch (saveError) {
      console.error("No se pudo guardar", saveError);
      if (axios.isAxiosError(saveError)) {
        const backendMessage =
          saveError.response?.data?.message ||
          saveError.response?.data?.error ||
          saveError.response?.data;
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : "No se pudo guardar los cambios. Intente nuevamente.",
        );
      } else {
        setError("No se pudo guardar los cambios. Intente nuevamente.");
      }
    } finally {
      setSaving(false);
    }
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
    <div className="p-3 paciente-page-container sipac-form-compact">
      <div className="mx-auto sipac-form-card">
        <PacienteFormHeader
          title={isEditMode ? "Editar paciente" : "Nuevo paciente"}
          subtitle={
            isEditMode
              ? "Actualizá los datos personales y de contacto"
              : "Cargá los datos personales y de contacto"
          }
          icon={isEditMode ? <FaUserEdit /> : <FaUserPlus />}
          onBack={() => navigate(-1)}
        />
        <CCard>
          <CCardBody>
            {error ? (
              <CAlert color="danger" className="mb-3">
                {error}
              </CAlert>
            ) : null}

            <div className="row g-3">
              <div className="col-12 col-lg-6">
                <div className="sipac-section-card h-100">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <CFormLabel className="sipac-label">Apellido</CFormLabel>
                      <CFormInput
                        className="sipac-input"
                        value={form.apellido}
                        invalid={!!fieldErrors.apellido}
                        onChange={(e) =>
                          handleChange("apellido", e.target.value)
                        }
                      />
                      {fieldErrors.apellido && (
                        <div className="text-danger small mt-1">
                          {fieldErrors.apellido}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <CFormLabel className="sipac-label">Nombre</CFormLabel>
                      <CFormInput
                        className="sipac-input"
                        value={form.nombre}
                        invalid={!!fieldErrors.nombre}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                      />
                      {fieldErrors.nombre && (
                        <div className="text-danger small mt-1">
                          {fieldErrors.nombre}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <CFormLabel className="sipac-label">DNI</CFormLabel>
                      <CFormInput
                        className="sipac-input"
                        value={form.dni}
                        invalid={!!fieldErrors.dni}
                        onChange={(e) => handleChange("dni", e.target.value)}
                      />
                      {fieldErrors.dni && (
                        <div className="text-danger small mt-1">
                          {fieldErrors.dni}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <CFormLabel className="sipac-label">
                        Fecha de Nacimiento
                      </CFormLabel>

                      <SipacDateInput
                        label=""
                        className="sipac-input"
                        value={form.fechaNacimiento}
                        invalid={!!fieldErrors.fechaNacimiento}
                        onValueChange={(value) =>
                          handleChange("fechaNacimiento", value)
                        }
                      />
                      {fieldErrors.fechaNacimiento && (
                        <div className="text-danger small mt-1">
                          {fieldErrors.fechaNacimiento}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <CFormLabel className="sipac-label">Sexo</CFormLabel>
                      <CFormSelect
                        className="sipac-select"
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
                    </div>
                    <div className="col-12 col-md-6">
                      <CFormLabel className="sipac-label">
                        Estado civil
                      </CFormLabel>
                      <CFormSelect
                        className="sipac-select"
                        value={form.estadoCivil}
                        invalid={!!fieldErrors.estadoCivil}
                        onChange={(e) =>
                          handleChange("estadoCivil", e.target.value)
                        }
                        options={[
                          { label: "Seleccione...", value: "" },
                          { label: "Soltero/a", value: "SOLTERO" },
                          { label: "Casado/a", value: "CASADO" },
                          { label: "Divorciado/a", value: "DIVORCIADO" },
                          { label: "Viudo/a", value: "VIUDO" },
                          {
                            label: "Unión convivencial",
                            value: "UNION_CONVIVENCIAL",
                          },
                        ]}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <CFormLabel className="sipac-label">
                        Nivel educativo
                      </CFormLabel>

                      <CFormSelect
                        className="sipac-select"
                        value={form.nivelEducativo}
                        invalid={!!fieldErrors.nivelEducativo}
                        onChange={(e) =>
                          handleChange("nivelEducativo", e.target.value)
                        }
                        options={[
                          { label: "Seleccione...", value: "" },
                          {
                            label: "Sin escolaridad",
                            value: "SIN_ESCOLARIDAD",
                          },
                          { label: "Primario", value: "PRIMARIO" },
                          { label: "Secundario", value: "SECUNDARIO" },
                          { label: "Terciario", value: "TERCIARIO" },
                          { label: "Universitario", value: "UNIVERSITARIO" },
                          { label: "Otro", value: "OTRO" },
                        ]}
                      />

                      {fieldErrors.nivelEducativo && (
                        <div className="text-danger small mt-1">
                          {fieldErrors.nivelEducativo}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <CFormLabel className="sipac-label">Teléfono</CFormLabel>
                      <CFormInput
                        className="sipac-input"
                        value={form.telefono}
                        invalid={!!fieldErrors.telefono}
                        onChange={(e) =>
                          handleChange("telefono", e.target.value)
                        }
                      />
                      {fieldErrors.telefono && (
                        <div className="text-danger small mt-1">
                          {fieldErrors.telefono}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-md-8">
                      <CFormLabel className="sipac-label">Email</CFormLabel>
                      <CFormInput
                        className="sipac-input"
                        value={form.email}
                        invalid={!!fieldErrors.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="sipac-section-card h-100">
                  <div className="row g-3">
                    <div className="col-12">
                      <CFormLabel className="sipac-label">Dirección</CFormLabel>
                      <CFormInput
                        className="sipac-input"
                        value={form.direccion}
                        invalid={!!fieldErrors.direccion}
                        onChange={(e) =>
                          handleChange("direccion", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-12">
                      <CFormLabel className="sipac-label">Ocupación</CFormLabel>
                      <CFormInput
                        className="sipac-input"
                        value={form.ocupacion}
                        invalid={!!fieldErrors.ocupacion}
                        onChange={(e) =>
                          handleChange("ocupacion", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-12">
                      <div className="sipac-field-block">
                        <div className="sipac-label d-flex align-items-center gap-2 mb-0">
                          <span>Con quién vive</span>

                          {form.convivientes.length > 0 && (
                            <span className="sipac-counter-badge">
                              {form.convivientes.length}
                            </span>
                          )}
                        </div>

                        <ConvivientesMultiSelect
                          label=""
                          className="sipac-convivientes"
                          options={CONVIVIENTE_OPTIONS}
                          selected={form.convivientes}
                          onChange={(nextValues) => {
                            setForm((prev) => ({
                              ...prev,
                              convivientes: nextValues,
                            }));

                            setFieldErrors((prev) => ({
                              ...prev,
                              convivientes: undefined,
                            }));
                          }}
                        />

                        {fieldErrors.convivientes && (
                          <div className="sipac-field-error">
                            {fieldErrors.convivientes}
                          </div>
                        )}

                        {!fieldErrors.convivientes &&
                          form.convivientes.length > 0 && (
                            <div className="sipac-field-helper">
                              Información útil para contexto familiar y social.
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sipac-form-footer">
              <button
                type="button"
                className="sipac-toolbar-btn sipac-toolbar-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>

              <button
                type="button"
                className="sipac-toolbar-btn"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
            </div>
          </CCardBody>
        </CCard>
      </div>
    </div>
  );
}
