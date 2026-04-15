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
import { createEmptyDiagnostico } from "../components/historia-clinica/diagnosticoUtils";

interface UseHistoriaClinicaEditorOptions {
  patientIdParam?: string;
  mode?: "create";
  onSaved: (patientId: number) => void;
}

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
                  descripcion:
                    typeof diagnostico.descripcion === "string" ? diagnostico.descripcion : "",
                  evolucion:
                    typeof diagnostico.evolucion === "string" ? diagnostico.evolucion : "",
                  tratamiento:
                    typeof diagnostico.tratamiento === "string" ? diagnostico.tratamiento : "",
                  cie10:
                    diagnostico.cie10 && typeof diagnostico.cie10 === "object"
                      ? (diagnostico.cie10 as Cie10DTO)
                      : undefined,
                  principal: diagnostico.principal === true,
                  fechaFin:
                    typeof diagnostico.fechaFin === "string" ? diagnostico.fechaFin : "",
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
    }));
  };

  const saveDiagnosticoDraft = () => {
    if (!diagnosticoDraft) return;

    setForm((prev) => {
      if (selectedIndex === null || isNewDiagnostico) {
        const nextDiagnosticos = [...prev.diagnosticos, { ...diagnosticoDraft }];
        return {
          ...prev,
          diagnosticos: diagnosticoDraft.principal
            ? nextDiagnosticos.map((diag, index) => ({
                ...diag,
                principal: index === nextDiagnosticos.length - 1,
              }))
            : nextDiagnosticos,
        };
      }

      const nextDiagnosticos = prev.diagnosticos.map((diag, index) =>
        index === selectedIndex ? { ...diagnosticoDraft } : diag,
      );

      return {
        ...prev,
        diagnosticos: diagnosticoDraft.principal
          ? nextDiagnosticos.map((diag, index) => ({
              ...diag,
              principal: index === selectedIndex,
            }))
          : nextDiagnosticos,
      };
    });

    if (selectedIndex === null || isNewDiagnostico) {
      setSelectedIndex(form.diagnosticos.length);
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
        next[0] = { ...next[0], principal: true };
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
    if (!pacienteId) return;

    setSubmitError("");

    if (!form.motivoConsulta.trim()) {
      setSubmitError("El motivo de consulta es obligatorio.");
      return;
    }

    const diagnosticos = form.diagnosticos
      .map((diag) => ({
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
        fechaFin: diag.fechaFin?.trim() || "",
      }))
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

    if (diagnosticos.length > 0 && !diagnosticos.some((diag) => diag.principal)) {
      setSubmitError("Si cargás diagnósticos, uno debe quedar marcado como principal.");
      return;
    }

    const payload: HistoriaClinicaPayload = {
      motivoConsulta: form.motivoConsulta.trim(),
      activa: form.activa ?? true,
      medicacion: form.medicacion?.trim() || "",
      consumo: form.consumo?.trim() || "",
      tratamientosAnteriores: form.tratamientosAnteriores?.trim() || "",
      observaciones: form.observaciones?.trim() || "",
      diagnosticos,
    };

    setSaving(true);
    try {
      if (exists) {
        await updateHistoriaClinica(pacienteId, payload);
      } else {
        await createHistoriaClinica(pacienteId, payload);
      }
      onSaved(pacienteId);
    } catch (submitError) {
      console.error("No se pudo guardar la historia clínica", submitError);
      setSubmitError("No se pudo guardar la historia clínica. Intente nuevamente.");
    } finally {
      setSaving(false);
    }
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
