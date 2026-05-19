import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { CSpinner } from "@coreui/react";
import {
  deletePaciente,
  getHistoriaClinicaByPacienteId,
  getPacienteById,
} from "../../api/pacientes";
import type {
  HistoriaClinicaDTO,
  Paciente,
  PacienteResponseDTO,
} from "../../api/pacientes";
import PacienteHeader from "../../components/pacientes/PacienteHeader";
import PacienteDatosCard from "../../components/pacientes/PacienteDatosCard";
import HistoriaClinicaCard from "../../components/pacientes/HistoriaClinicaCard";
import DeletePacienteModal from "../../components/pacientes/DeletePacienteModal";
import { formatEstadoCivil, formatDate, formatConviviente, formatNivelEducativo, asRecord, firstString, firstStringArray } from "../../utils/pacienteFormatters";
import "../../styles/paciente.css";

interface LocationState {
  paciente?: Paciente;
}

export default function PacientePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { paciente } = (location.state as LocationState) || {};
  const [detalle, setDetalle] = useState<PacienteResponseDTO | null>(null);
  const [historiaClinica, setHistoriaClinica] =
    useState<HistoriaClinicaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const sipacBlue = "#2F6FB3";

  const pacienteId = useMemo(() => {
    if (paciente?.id) return paciente.id;
    if (!id) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id, paciente?.id]);

  useEffect(() => {
    const loadDetalle = async () => {
      if (!pacienteId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getPacienteById(pacienteId);
        setDetalle(data);
        try {
          const historia = await getHistoriaClinicaByPacienteId(pacienteId);
          setHistoriaClinica(historia);
        } catch (historiaError) {
          console.warn(
            "No se pudo cargar historia clínica desde endpoint dedicado",
            historiaError,
          );
        }
      } catch (error) {
        console.error("No se pudo cargar el detalle del paciente", error);
        if (paciente) {
          setDetalle(paciente as PacienteResponseDTO);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDetalle();
  }, [pacienteId, paciente]);

  const pacienteData = useMemo(() => {
    if (detalle) return asRecord(detalle);
    if (paciente) return asRecord(paciente);
    return null;
  }, [detalle, paciente]);

  const fechaAlta = formatDate(
    firstString(pacienteData ?? {}, ["fechaAlta", "fecha_alta"]),
  );
  const apellidoPaciente = firstString(pacienteData ?? {}, ["apellido"]) || "";
  const nombrePaciente =
    firstString(pacienteData ?? {}, ["nombre", "nombres"]) || "";
  const pacienteNombreCompleto =
    `${apellidoPaciente} ${nombrePaciente}`.trim() || "Paciente";

  const historiaClinicaId =
    (historiaClinica?.id as number | undefined) ??
    (pacienteData?.historiaClinicaId as number | undefined) ??
    (pacienteData?.historia_clinica_id as number | undefined);
  const hasHistoriaClinica = Boolean(historiaClinicaId);
  const convivientes = firstStringArray(pacienteData ?? {}, ["convivientes"]);

  const identificacionContactoFields: Array<{ label: string; value: string }> =
    [
      {
        label: "DNI",
        value: firstString(pacienteData ?? {}, ["dni", "documento"]) || "-",
      },
      {
        label: "Fecha de nacimiento",
        value: formatDate(
          firstString(pacienteData ?? {}, [
            "fechaNacimiento",
            "fecha_nacimiento",
          ]),
        ),
      },
      {
        label: "Teléfono",
        value:
          firstString(pacienteData ?? {}, [
            "telefono",
            "teléfono",
            "celular",
          ]) || "-",
      },
      {
        label: "Email",
        value: firstString(pacienteData ?? {}, ["email", "correo"]) || "-",
      },
      {
        label: "Dirección",
        value:
          firstString(pacienteData ?? {}, [
            "direccion",
            "dirección",
            "domicilio",
          ]) || "-",
      },
      {
        label: "Fecha de alta",
        value: fechaAlta,
      },
    ];

  const estadoConvivenciaFields: Array<{ label: string; value: string }> = [
    {
      label: "Estado civil",
      value: formatEstadoCivil(
        firstString(pacienteData ?? {}, [
          "estadoCivil",
          "estado_civil",
          "civilStatus",
        ]),
      ),
    },
    {
      label: "Sexo",
      value:
        firstString(pacienteData ?? {}, ["sexo", "genero", "género"]) || "-",
    },
    {
      label: "Ocupación",
      value: firstString(pacienteData ?? {}, ["ocupacion", "ocupación"]) || "-",
    },
  ];
  const nivelEducativo = formatNivelEducativo(
    firstString(pacienteData ?? {}, ["nivelEducativo", "nivel_educativo"]),
  );

  const handleDeletePaciente = async () => {
    if (!pacienteId) return;

    setActionError("");
    setDeleting(true);
    try {
      await deletePaciente(pacienteId);
      setShowDeleteModal(false);
      navigate("/");
    } catch (error) {
      console.error("No se pudo eliminar el paciente", error);
      setActionError("No se pudo eliminar el paciente. Intente nuevamente.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-3">
      <PacienteHeader
        pacienteNombreCompleto={pacienteNombreCompleto}
        pacienteId={pacienteId}
        sipacBlue={sipacBlue}
        onEdit={() => {
          if (pacienteId) {
            navigate(`/pacientes/${pacienteId}/editar`);
          }
        }}
        onDelete={() => {
          setActionError("");
          setShowDeleteModal(true);
        }}
        onBack={() => navigate(-1)}
      />
      {loading ? (
        <div className="d-flex align-items-center gap-2 text-muted">
          <CSpinner size="sm" />
          Cargando detalle...
        </div>
      ) : pacienteData ? (
        <div className="d-flex flex-column gap-3">
          <PacienteDatosCard
            identificacionContactoFields={identificacionContactoFields}
            estadoConvivenciaFields={estadoConvivenciaFields}
            nivelEducativo={nivelEducativo}
            convivientes={convivientes}
            formatConviviente={formatConviviente}
          />

          <HistoriaClinicaCard
            hasHistoriaClinica={hasHistoriaClinica}
            pacienteId={pacienteId}
            onOpenHistoriaClinica={() => {
              if (!pacienteId) return;

              navigate(
                hasHistoriaClinica
                  ? `/pacientes/${pacienteId}/historia-clinica`
                  : `/pacientes/${pacienteId}/historia-clinica/editar`,
                {
                  state: hasHistoriaClinica ? undefined : { mode: "create" },
                },
              );
            }}
          />
        </div>
      ) : (
        <div className="alert alert-warning mb-0" role="alert">
          No se encontró información del paciente{" "}
          {pacienteId ? `#${pacienteId}` : ""}. Volvé al listado y abrí el
          detalle desde allí.
        </div>
      )}

      <DeletePacienteModal
        visible={showDeleteModal}
        deleting={deleting}
        pacienteNombreCompleto={pacienteNombreCompleto}
        actionError={actionError}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePaciente}
      />
    </div>
  );
}
