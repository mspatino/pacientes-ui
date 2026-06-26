import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CRow,
} from "@coreui/react";
import {
  type AdminRole,
  type AdminUser,
  createAdminRole,
  createAdminUser,
  deleteAdminRole,
  deleteAdminUser,
  getAdminRoles,
  getAdminUsers,
  updateAdminUser,
} from "../api/configuracion";

type ConfigTab = "usuarios" | "roles";

interface UserFormState {
  id?: number;
  username: string;
  email: string;
  password: string;
  enabled: boolean;
  roles: string[];
}

const emptyUserForm: UserFormState = {
  username: "",
  email: "",
  password: "",
  enabled: true,
  roles: ["ROLE_USER"],
};

const baseRoles = new Set(["ROLE_USER", "ROLE_ADMIN"]);

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || "No se pudo completar la operación";
  }

  return "No se pudo completar la operación";
};

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("usuarios");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  );

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [usersData, rolesData] = await Promise.all([
        getAdminUsers(),
        getAdminRoles(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateUserForm = <K extends keyof UserFormState>(key: K, value: UserFormState[K]) => {
    setUserForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleRole = (roleNameToToggle: string) => {
    setUserForm((current) => {
      const selected = current.roles.includes(roleNameToToggle)
        ? current.roles.filter((role) => role !== roleNameToToggle)
        : [...current.roles, roleNameToToggle];

      return {
        ...current,
        roles: selected.length > 0 ? selected : ["ROLE_USER"],
      };
    });
  };

  const resetUserForm = () => {
    setUserForm(emptyUserForm);
  };

  const submitUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingUser(true);
    setError("");
    setMessage("");

    const payload = {
      username: userForm.username.trim(),
      email: userForm.email.trim(),
      password: userForm.password.trim() || undefined,
      enabled: userForm.enabled,
      roles: userForm.roles,
    };

    try {
      if (userForm.id) {
        await updateAdminUser(userForm.id, payload);
        setMessage("Usuario actualizado");
      } else {
        await createAdminUser({
          ...payload,
          password: userForm.password.trim(),
        });
        setMessage("Usuario creado");
      }

      resetUserForm();
      await loadData();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSavingUser(false);
    }
  };

  const editUser = (user: AdminUser) => {
    setActiveTab("usuarios");
    setUserForm({
      id: user.id,
      username: user.username,
      email: user.email,
      password: "",
      enabled: user.enabled,
      roles: user.roles.length > 0 ? user.roles : ["ROLE_USER"],
    });
  };

  const removeUser = async (user: AdminUser) => {
    if (!window.confirm(`¿Eliminar usuario ${user.username}?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteAdminUser(user.id);
      setMessage("Usuario eliminado");
      await loadData();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  const submitRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingRole(true);
    setError("");
    setMessage("");

    try {
      await createAdminRole(roleName.trim());
      setRoleName("");
      setMessage("Rol creado");
      await loadData();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSavingRole(false);
    }
  };

  const removeRole = async (role: AdminRole) => {
    if (!window.confirm(`¿Eliminar rol ${role.name}?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteAdminRole(role.id);
      setMessage("Rol eliminado");
      await loadData();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  return (
    <div className="paciente-page-container">
      <CCard className="sipac-form-card">
        <CCardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <strong>Configuración</strong>
          <div className="btn-group btn-group-sm" role="group" aria-label="Secciones de configuración">
            <button
              type="button"
              className={`btn ${activeTab === "usuarios" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("usuarios")}
            >
              Usuarios
            </button>
            <button
              type="button"
              className={`btn ${activeTab === "roles" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActiveTab("roles")}
            >
              Roles
            </button>
          </div>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {message && <CAlert color="success">{message}</CAlert>}

          {activeTab === "usuarios" && (
            <div className="d-grid gap-3">
              <CForm onSubmit={submitUser}>
                <CRow className="g-3 align-items-end">
                  <CCol md={3}>
                    <CFormLabel>Usuario</CFormLabel>
                    <CFormInput
                      value={userForm.username}
                      onChange={(event) => updateUserForm("username", event.target.value)}
                      required
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel>Email</CFormLabel>
                    <CFormInput
                      type="email"
                      value={userForm.email}
                      onChange={(event) => updateUserForm("email", event.target.value)}
                      required
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel>Contraseña</CFormLabel>
                    <CFormInput
                      type="password"
                      value={userForm.password}
                      placeholder={userForm.id ? "Sin cambios" : ""}
                      onChange={(event) => updateUserForm("password", event.target.value)}
                      required={!userForm.id}
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormCheck
                      label="Usuario activo"
                      checked={userForm.enabled}
                      onChange={(event) => updateUserForm("enabled", event.target.checked)}
                    />
                  </CCol>
                  <CCol xs={12}>
                    <div className="d-flex flex-wrap gap-3">
                      {sortedRoles.map((role) => (
                        <CFormCheck
                          key={role.id}
                          label={role.name}
                          checked={userForm.roles.includes(role.name)}
                          onChange={() => toggleRole(role.name)}
                        />
                      ))}
                    </div>
                  </CCol>
                  <CCol xs={12} className="d-flex gap-2 flex-wrap">
                    <CButton color="primary" size="sm" type="submit" disabled={savingUser}>
                      {userForm.id ? "Actualizar usuario" : "Crear usuario"}
                    </CButton>
                    {userForm.id && (
                      <CButton color="secondary" variant="outline" size="sm" type="button" onClick={resetUserForm}>
                        Cancelar edición
                      </CButton>
                    )}
                  </CCol>
                </CRow>
              </CForm>

              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Roles</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5}>Cargando...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5}>No hay usuarios cargados.</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.enabled ? "Activo" : "Inactivo"}</td>
                          <td>{user.roles.join(", ")}</td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-2">
                              <CButton color="primary" variant="outline" size="sm" onClick={() => editUser(user)}>
                                Editar
                              </CButton>
                              <CButton color="danger" variant="outline" size="sm" onClick={() => removeUser(user)}>
                                Eliminar
                              </CButton>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="d-grid gap-3">
              <CForm onSubmit={submitRole}>
                <CRow className="g-3 align-items-end">
                  <CCol md={6} lg={4}>
                    <CFormLabel>Nuevo rol</CFormLabel>
                    <CFormInput
                      value={roleName}
                      placeholder="Ej: auditor"
                      onChange={(event) => setRoleName(event.target.value)}
                      required
                    />
                  </CCol>
                  <CCol md="auto">
                    <CButton color="primary" size="sm" type="submit" disabled={savingRole}>
                      Crear rol
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>

              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Rol</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={2}>Cargando...</td>
                      </tr>
                    ) : sortedRoles.length === 0 ? (
                      <tr>
                        <td colSpan={2}>No hay roles cargados.</td>
                      </tr>
                    ) : (
                      sortedRoles.map((role) => (
                        <tr key={role.id}>
                          <td>{role.name}</td>
                          <td className="text-end">
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              disabled={baseRoles.has(role.name)}
                              onClick={() => removeRole(role)}
                            >
                              Eliminar
                            </CButton>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
}
