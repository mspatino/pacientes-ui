import { useEffect, useMemo, useState } from "react";
import type {
  Cie10DTO,
  DiagnosticoDTO,
  HistoriaClinicaDTO,
  HistoriaClinicaPayload,
  PacienteResponseDTO,
} from "../api/pacientes";
import {
  createHistoriaClinica,
  getHistoriaClinicaByPacienteId,
  getPacienteById,
  updateHistoriaClinica,
} from "../api/pacientes";
import {
  createEmptyDiagnostico,
  getDiagnosticoFechaFin,
  getDiagnosticoText,
  isDiagnosticoPrincipal,
} from "../components/historia_clinica/diagnosticos/diagnosticoUtils";
//import { SlSocialYoutube } from "react-icons/sl";

interface UseHistoriaClinicaEditorOptions {
  patientIdParam?: string;
  mode?: "create";
  onSaved: (patientId: number) => void;
}

interface DiagnosticoPayloadCompat {
  id?: number;
  descripcion: string;
  evolucion: string;
  tratamiento: string;
  cie10?: Cie10DTO;
  principal: boolean;
  tipo?: string;
  fechaFin?: string;
  fecha_fin?: string;
}

const getTipoFromPrincipal = (principal: boolean) =>
  principal ? "PRINCIPAL" : "SECUNDARIO";

const normalizeLocalDateTime = (value?: string) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed) ? `${trimmed}:00` : trimmed;
};

export default function useHistoriaClinicaEditor({
  patientIdParam,
  mode,
  onSaved,
}: UseHistoriaClinicaEditorOptions) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [pacienteNombre, setPacienteNombre] = useState("Paciente");
  const [exists, setExists] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [diagnosticoModalVisible, setDiagnosticoModalVisible] = useState(false);
  const [diagnosticoEditMode, setDiagnosticoEditMode] = useState(false);
  const [diagnosticoDraft, setDiagnosticoDraft] = useState<DiagnosticoDTO | null>(null);
  const [isNewDiagnostico, setIsNewDiagnostico] = useState(false);
  const [form, setForm] = useState<HistoriaClinicaPayload>({
    motivoConsulta: "",
    activa: true,
    medicacion: "",
    consumo: "",
    tratamientosAnteriores: "",
    observaciones: "",
    diagnosticos: [],
  });

  const pacienteId = useMemo(() => {
    if (!patientIdParam) return null;
    const parsed = Number(patientIdParam);
    return Number.isNaN(parsed) ? null : parsed;
  }, [patientIdParam]);

  useEffect(() => {
    const loadData = async () => {
      if (!pacienteId) {
        setLoading(false);
        setError("ID de paciente inválido.");
        return;
      }

      try {
        const pacienteData: PacienteResponseDTO = await getPacienteById(pacienteId);
        const apellido = (pacienteData.apellido || "").trim();
        const nombre = (pacienteData.nombre || "").trim();
        const fullName = `${apellido} ${nombre}`.trim();
        if (fullName) setPacienteNombre(fullName);
      } catch (pacienteError) {
        console.warn("No se pudo cargar nombre del paciente", pacienteError);
      }

      try {
        const data: HistoriaClinicaDTO = await getHistoriaClinicaByPacienteId(pacienteId);
        setExists(true);
        setForm({
          motivoConsulta: data.motivoConsulta || "",
          activa: typeof data.activa === "boolean" ? data.activa : true,
          medicacion: data.medicacion || "",
          consumo: data.consumo || "",
          tratamientosAnteriores: data.tratamientosAnteriores || "",
          observaciones: data.observaciones || "",
          diagnosticos: Array.isArray(data.diagnosticos)
            ? data.diagnosticos.map((item) => {
                const diagnostico = item as Record<string, unknown>;
                return {
                  id:
                    typeof diagnostico.id === "number"
                      ? diagnostico.id
                      : typeof diagnostico.id === "string" && diagnostico.id.trim()
                        ? Number(diagnostico.id)
                        : undefined,
                  descripcion:
                    getDiagnosticoText(diagnostico, "descripcion"),
                  evolucion: getDiagnosticoText(diagnostico, "evolucion"),
                  tratamiento:
                    getDiagnosticoText(diagnostico, "tratamiento"),
                  cie10:
                    diagnostico.cie10 && typeof diagnostico.cie10 === "object"
                      ? (diagnostico.cie10 as Cie10DTO)
                      : undefined,
                  principal: isDiagnosticoPrincipal(diagnostico),
                  tipo:
                    typeof diagnostico.tipo === "string" ? diagnostico.tipo : undefined,
                  fechaFin: getDiagnosticoFechaFin(diagnostico),
                };
              })
            : [],
        });
        setSelectedIndex(
          Array.isArray(data.diagnosticos) && data.diagnosticos.length > 0 ? 0 : null,
        );
      } catch (historiaError) {
        if (mode === "create") {
          setExists(false);
          setSelectedIndex(null);
        } else {
          console.warn(
            "No se encontró historia clínica previa, se habilita modo alta",
            historiaError,
          );
          setExists(false);
          setSelectedIndex(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pacienteId, mode]);

  const pageTitle = exists ? "Editar historia clínica" : "Alta de historia clínica";

  const selectedDiagnostico =
    selectedIndex !== null ? form.diagnosticos[selectedIndex] ?? null : null;
  const activeDiagnostico = diagnosticoEditMode ? diagnosticoDraft : selectedDiagnostico;

  const openDiagnosticoModal = (index: number, editMode = false) => {
    setSelectedIndex(index);
    setDiagnosticoDraft({ ...(form.diagnosticos[index] ?? createEmptyDiagnostico()) });
    setIsNewDiagnostico(false);
    setDiagnosticoEditMode(editMode);
    setDiagnosticoModalVisible(true);
  };

  const closeDiagnosticoModal = () => {
    setDiagnosticoModalVisible(false);
    setDiagnosticoEditMode(false);
    setDiagnosticoDraft(null);
    setIsNewDiagnostico(false);
  };

  const handleDiagnosticoDraftChange = (
    field: keyof DiagnosticoDTO,
    value: string | boolean | Cie10DTO | null,
  ) => {
    setDiagnosticoDraft((prev) => ({
      ...(prev ?? createEmptyDiagnostico()),
      [field]: value,
      ...(field === "principal"
        ? {
            tipo: getTipoFromPrincipal(Boolean(value)),
            fechaFin: value === true ? "" : prev?.fechaFin,
          }
        : {}),
    }));
  };

  const normalizeDiagnosticosPrincipal = (
    diagnosticos: DiagnosticoDTO[],
    principalIndex: number | null,
  ) =>
    diagnosticos.map((diag, index) => {
      const isPrincipal = principalIndex !== null && index === principalIndex;
      return {
        ...diag,
        principal: isPrincipal,
        tipo: getTipoFromPrincipal(isPrincipal),
      };
    });

  const applyDiagnosticoDraftToForm = (
    currentForm: HistoriaClinicaPayload,
    draft: DiagnosticoDTO,
  ): HistoriaClinicaPayload => {
    if (selectedIndex === null || isNewDiagnostico) {
      const nextDiagnosticos = [
        ...currentForm.diagnosticos,
        {
          ...draft,
          tipo: getTipoFromPrincipal(Boolean(draft.principal)),
        },
      ];
      return {
        ...currentForm,
        diagnosticos: draft.principal
          ? normalizeDiagnosticosPrincipal(nextDiagnosticos, nextDiagnosticos.length - 1)
          : nextDiagnosticos,
      };
    }

    const nextDiagnosticos = currentForm.diagnosticos.map((diag, index) =>
      index === selectedIndex
        ? {
            ...draft,
            tipo: getTipoFromPrincipal(Boolean(draft.principal)),
          }
        : diag,
    );

    return {
      ...currentForm,
      diagnosticos: draft.principal
        ? normalizeDiagnosticosPrincipal(nextDiagnosticos, selectedIndex)
        : nextDiagnosticos,
    };
  };

  const buildPayloadFromForm = (currentForm: HistoriaClinicaPayload): HistoriaClinicaPayload => {
    const diagnosticos = currentForm.diagnosticos
      .map((diag) => {
        const fechaFin = normalizeLocalDateTime(diag.fechaFin);

        const diagnosticoPayload: DiagnosticoPayloadCompat = {
          id: typeof diag.id === "number" ? diag.id : undefined,
          descripcion: diag.descripcion?.trim() || "",
          evolucion: diag.evolucion?.trim() || "",
          tratamiento: diag.tratamiento?.trim() || "",
          cie10:
            diag.cie10?.codigo || diag.cie10?.descripcion
              ? {
                  codigo: diag.cie10?.codigo?.trim() || "",
                  descripcion: diag.cie10?.descripcion?.trim() || "",
                }
              : undefined,
          principal: Boolean(diag.principal),
          tipo: getTipoFromPrincipal(Boolean(diag.principal)),
          fechaFin: fechaFin || undefined,
          fecha_fin: fechaFin || undefined,
        };

        return diagnosticoPayload;
      })
      .filter(
        (diag) =>
          diag.descripcion ||
          diag.evolucion ||
          diag.tratamiento ||
          diag.cie10?.codigo ||
          diag.cie10?.descripcion ||
          diag.principal ||
          diag.fechaFin,
      );

    return {
      motivoConsulta: currentForm.motivoConsulta.trim(),
      activa: currentForm.activa ?? true,
      medicacion: currentForm.medicacion?.trim() || "",
      consumo: currentForm.consumo?.trim() || "",
      tratamientosAnteriores: currentForm.tratamientosAnteriores?.trim() || "",
      observaciones: currentForm.observaciones?.trim() || "",
      diagnosticos: diagnosticos as HistoriaClinicaPayload["diagnosticos"],
    };
  };

  const persistHistoriaClinica = async (
    currentForm: HistoriaClinicaPayload,
    options?: { redirectOnSuccess?: boolean },
  ) => {
    if (!pacienteId) return;

    const payload = buildPayloadFromForm(currentForm);

    if (!payload.motivoConsulta.trim()) {
      setSubmitError("El motivo de consulta es obligatorio.");
      return;
    }

    if (payload.diagnosticos.length > 0 && !payload.diagnosticos.some((diag) => diag.principal)) {
      setSubmitError("Actualmente no hay diagnóstico principal activo.");
      return;
    }

    setSaving(true);
    try {
      if (exists) {
        await updateHistoriaClinica(pacienteId, payload);
      } else {
        await createHistoriaClinica(pacienteId, payload);
        setExists(true);
      }

      if (options?.redirectOnSuccess) {
        onSaved(pacienteId);
      }
    } catch (submitError) {
      console.error("No se pudo guardar la historia clínica", submitError);
      setSubmitError("No se pudo guardar la historia clínica. Intente nuevamente.");
      throw submitError;
    } finally {
      setSaving(false);
    }
  };

  const saveDiagnosticoDraft = async () => {
    if (!diagnosticoDraft) return;

    const nextForm = applyDiagnosticoDraftToForm(form, diagnosticoDraft);
    setForm(nextForm);

    if (selectedIndex === null || isNewDiagnostico) {
      setSelectedIndex(form.diagnosticos.length);
    }

    if (exists) {
      try {
        await persistHistoriaClinica(nextForm, { redirectOnSuccess: false });
      } catch {
        return;
      }
    }

    closeDiagnosticoModal();
  };

  const addDiagnostico = () => {
    setSelectedIndex(null);
    setDiagnosticoDraft({
      ...createEmptyDiagnostico(),
      principal: form.diagnosticos.length === 0,
    });
    setIsNewDiagnostico(true);
    setDiagnosticoEditMode(true);
    setDiagnosticoModalVisible(true);
  };

  const removeDiagnostico = (index: number) => {
    setForm((prev) => {
      const next = prev.diagnosticos.filter((_, currentIndex) => currentIndex !== index);
      if (next.length === 1 && !next.some((diag) => diag.principal)) {
        next[0] = {
          ...next[0],
          principal: true,
          tipo: getTipoFromPrincipal(true),
        };
      }
      return {
        ...prev,
        diagnosticos: next,
      };
    });
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
    if (selectedIndex === index) {
      setDiagnosticoModalVisible(false);
      setDiagnosticoEditMode(false);
      setDiagnosticoDraft(null);
      setIsNewDiagnostico(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    await persistHistoriaClinica(form, { redirectOnSuccess: true });
  };

  return {
    activeDiagnostico,
    addDiagnostico,
    closeDiagnosticoModal,
    diagnosticoDraft,
    diagnosticoEditMode,
    diagnosticoModalVisible,
    error,
    exists,
    form,
    handleDiagnosticoDraftChange,
    handleSubmit,
    isNewDiagnostico,
    loading,
    openDiagnosticoModal,
    pageTitle,
    pacienteId,
    pacienteNombre,
    removeDiagnostico,
    saveDiagnosticoDraft,
    saving,
    selectedDiagnostico,
    selectedIndex,
    setDiagnosticoDraft,
    setDiagnosticoEditMode,
    setForm,
    setSelectedIndex,
    submitError,
  };
}
