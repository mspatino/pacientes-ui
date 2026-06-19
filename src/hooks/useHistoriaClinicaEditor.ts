import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Cie10DTO,
  DiagnosticoDTO,
  EvolucionDiagnosticoDTO,
  HistoriaClinicaDTO,
  HistoriaClinicaPayload,
  PacienteResponseDTO,
  TipoDiagnostico,
} from "../api/pacientes";
import {
  actualizarDiagnostico,
  createHistoriaClinica,
  crearDiagnosticoEnHistoria,
  eliminarDiagnostico,
  getHistoriaClinicaByPacienteId,
  getPacienteById,
  updateHistoriaClinica,
} from "../api/pacientes";
import {
  createEmptyDiagnostico,
  type DiagnosticoModalMode,
  getDiagnosticoFechaFin,
  getDiagnosticoFechaInicio,
  getDiagnosticoText,
  isDiagnosticoPrincipal,
  normalizeTipoDiagnostico,
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
  tratamiento: string;
  cie10?: Cie10DTO;
  principal: boolean;
  tipo?: TipoDiagnostico;
  fechaInicio?: string;
  fecha_inicio?: string;
  fechaFin?: string;
  fecha_fin?: string;
}

const isTipoPrincipal = (tipo?: unknown) =>
  normalizeTipoDiagnostico(tipo) === "PRINCIPAL";

const normalizeLocalDateTime = (value?: string) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed) ? `${trimmed}:00` : trimmed;
};

const parseOptionalNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const buildDiagnosticoFromRecord = (
  diagnostico: Record<string, unknown>,
): DiagnosticoDTO => {
  const tipo = isDiagnosticoPrincipal(diagnostico)
    ? "PRINCIPAL"
    : normalizeTipoDiagnostico(diagnostico.tipo);

  return {
    id: parseOptionalNumber(diagnostico.id),
    descripcion:
      getDiagnosticoText(diagnostico, "descripcion"),
    evolucion: "",
    tratamiento:
      getDiagnosticoText(diagnostico, "tratamiento"),
    cie10:
      diagnostico.cie10 && typeof diagnostico.cie10 === "object"
        ? (diagnostico.cie10 as Cie10DTO)
        : undefined,
    principal: tipo === "PRINCIPAL",
    tipo,
    evoluciones: Array.isArray(diagnostico.evoluciones)
      ? diagnostico.evoluciones
          .filter(
            (evolucion): evolucion is Record<string, unknown> =>
              Boolean(evolucion) && typeof evolucion === "object",
          )
          .map((evolucion) => ({
            id: parseOptionalNumber(evolucion.id),
            fecha:
              typeof evolucion.fecha === "string"
                ? evolucion.fecha
                : undefined,
            nota:
              typeof evolucion.nota === "string"
                ? evolucion.nota
                : undefined,
            evolucion:
              typeof evolucion.evolucion === "string"
                ? evolucion.evolucion
                : undefined,
            tratamiento:
              typeof evolucion.tratamiento === "string"
                ? evolucion.tratamiento
                : undefined,
            descripcion:
              typeof evolucion.descripcion === "string"
                ? evolucion.descripcion
                : undefined,
          }))
      : [],
    fechaInicio: getDiagnosticoFechaInicio(diagnostico),
    fechaFin: getDiagnosticoFechaFin(diagnostico),
  };
};

const getDiagnosticoFechaOrden = (diagnostico: DiagnosticoDTO) => {
  const fechaInicio = getDiagnosticoFechaInicio(diagnostico);
  const timestamp = fechaInicio ? new Date(fechaInicio).getTime() : Number.NaN;

  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

const ordenarDiagnosticosRecientesPrimero = (
  diagnosticos: DiagnosticoDTO[],
): DiagnosticoDTO[] =>
  [...diagnosticos].sort((a, b) => {
    const fechaDiff = getDiagnosticoFechaOrden(b) - getDiagnosticoFechaOrden(a);
    if (fechaDiff !== 0) return fechaDiff;

    return (b.id ?? 0) - (a.id ?? 0);
  });

const buildFormFromHistoriaClinica = (data: HistoriaClinicaDTO): HistoriaClinicaPayload => ({
  motivoConsulta: data.motivoConsulta || "",
  fechaAlta: data.fechaAlta || "",
  antecedentesFamiliares: data.antecedentesFamiliares || "",
  antecedentesPersonales: data.antecedentesPersonales || "",
  contextoSocial: data.contextoSocial || "",
  actividadesVidaDiaria: data.actividadesVidaDiaria || "",
  objetivosTerapeuticos: data.objetivosTerapeuticos || "",
  activa: typeof data.activa === "boolean" ? data.activa : true,
  medicacion: data.medicacion || "",
  consumo: data.consumo || "",
  tratamientosAnteriores: data.tratamientosAnteriores || "",
  observaciones: data.observaciones || "",
  evaluaciones: Array.isArray(data.evaluaciones) ? data.evaluaciones : [],
  diagnosticos: Array.isArray(data.diagnosticos)
    ? ordenarDiagnosticosRecientesPrimero(
        data.diagnosticos.map((item) => {
          const diagnostico = item as Record<string, unknown>;
          return buildDiagnosticoFromRecord(diagnostico);
        }),
      )
    : [],
});

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
  const [historiaClinicaId, setHistoriaClinicaId] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [diagnosticoModalVisible, setDiagnosticoModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<DiagnosticoModalMode>("view");
  const [diagnosticoDraft, setDiagnosticoDraft] = useState<DiagnosticoDTO | null>(null);
  const [form, setForm] = useState<HistoriaClinicaPayload>({
    motivoConsulta: "",
    fechaAlta: new Date().toISOString(),
    antecedentesFamiliares: "",
    antecedentesPersonales: "",
    contextoSocial: "",
    actividadesVidaDiaria: "",
    objetivosTerapeuticos: "",
    activa: true,
    medicacion: "",
    consumo: "",
    tratamientosAnteriores: "",
    observaciones: "",
    evaluaciones: [],
    diagnosticos: [],
  });

  const pacienteId = useMemo(() => {
    if (!patientIdParam) return null;
    const parsed = Number(patientIdParam);
    return Number.isNaN(parsed) ? null : parsed;
  }, [patientIdParam]);

  const reloadHistoriaClinica = useCallback(async () => {
    if (!pacienteId) return;

    const data: HistoriaClinicaDTO = await getHistoriaClinicaByPacienteId(pacienteId);
    const firstDiagnostico = Array.isArray(data.diagnosticos)
      ? data.diagnosticos[0] as Record<string, unknown> | undefined
      : undefined;
    const nextHistoriaId =
      parseOptionalNumber(data.id) ??
      parseOptionalNumber(firstDiagnostico?.historiaClinicaId);
    setExists(true);
    setHistoriaClinicaId(nextHistoriaId ?? null);
    setForm(buildFormFromHistoriaClinica(data));
  }, [pacienteId]);

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
        const firstDiagnostico = Array.isArray(data.diagnosticos)
          ? data.diagnosticos[0] as Record<string, unknown> | undefined
          : undefined;
        const nextHistoriaId =
          parseOptionalNumber(data.id) ??
          parseOptionalNumber(firstDiagnostico?.historiaClinicaId);
        setExists(true);
        setHistoriaClinicaId(nextHistoriaId ?? null);
        setForm(buildFormFromHistoriaClinica(data));
        setEditingIndex(null);
      } catch (historiaError) {
        if (mode === "create") {
          setExists(false);
          setHistoriaClinicaId(null);
          setEditingIndex(null);
        } else {
          console.warn(
            "No se encontró historia clínica previa, se habilita modo alta",
            historiaError,
          );
          setExists(false);
          setHistoriaClinicaId(null);
          setEditingIndex(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pacienteId, mode]);

  const pageTitle = exists ? "Editar historia clínica" : "Alta de historia clínica";

  const selectedDiagnostico =
    editingIndex !== null ? form.diagnosticos[editingIndex] ?? null : null;
  const activeDiagnostico = modalMode === "view" ? selectedDiagnostico : diagnosticoDraft;

  const openDiagnosticoModal = (index: number) => {
    setEditingIndex(index);
    setDiagnosticoDraft({ ...(form.diagnosticos[index] ?? createEmptyDiagnostico()) });
    setModalMode("view");
    setDiagnosticoModalVisible(true);
  };

  const editDiagnostico = (index: number) => {
    setEditingIndex(index);
    setDiagnosticoDraft({ ...(form.diagnosticos[index] ?? createEmptyDiagnostico()) });
    setModalMode("edit");
    setDiagnosticoModalVisible(true);
  };

  const closeDiagnosticoModal = () => {
    setDiagnosticoModalVisible(false);
    setModalMode("view");
    setDiagnosticoDraft(null);
    setEditingIndex(null);
  };

  const handleDiagnosticoDraftChange = (
    field: keyof DiagnosticoDTO,
    value: string | boolean | Cie10DTO | EvolucionDiagnosticoDTO[] | null,
  ) => {
    const tipo = field === "tipo" ? normalizeTipoDiagnostico(value) : undefined;
    const isPrincipalField = field === "principal";

    setDiagnosticoDraft((prev) => ({
      ...(prev ?? createEmptyDiagnostico()),
      [field]: tipo ?? value,
      ...(isPrincipalField
        ? {
            tipo: value ? "PRINCIPAL" : "SECUNDARIO",
            fechaFin: value === true ? "" : prev?.fechaFin,
          }
        : {}),
      ...(field === "tipo"
        ? {
            principal: tipo === "PRINCIPAL",
          }
        : {}),
    }));
  };

  const normalizeDiagnosticosPrincipal = (
    diagnosticos: DiagnosticoDTO[],
    principalIndex: number | null,
  ): DiagnosticoDTO[] =>
    diagnosticos.map((diag, index) => {
      const isPrincipal = principalIndex !== null && index === principalIndex;
      const tipo = normalizeTipoDiagnostico(diag.tipo);
      const nextTipo =
        isPrincipal
          ? "PRINCIPAL"
          : tipo === "PRINCIPAL"
            ? "SECUNDARIO"
            : tipo;

      return {
        ...diag,
        principal: isPrincipal,
        tipo: nextTipo as TipoDiagnostico,
      };
    });

  const applyDiagnosticoDraftToForm = (
    currentForm: HistoriaClinicaPayload,
    draft: DiagnosticoDTO,
  ): HistoriaClinicaPayload => {
    if (modalMode === "create" || editingIndex === null) {
      const nextDiagnosticos = [
        ...currentForm.diagnosticos,
        {
          ...draft,
          tipo: normalizeTipoDiagnostico(draft.tipo),
          principal: isTipoPrincipal(draft.tipo),
        },
      ];
      return {
        ...currentForm,
        diagnosticos: isTipoPrincipal(draft.tipo)
          ? normalizeDiagnosticosPrincipal(nextDiagnosticos, nextDiagnosticos.length - 1)
          : nextDiagnosticos,
      };
    }

    const nextDiagnosticos = currentForm.diagnosticos.map((diag, index) =>
      index === editingIndex
        ? {
            ...draft,
            tipo: normalizeTipoDiagnostico(draft.tipo),
            principal: isTipoPrincipal(draft.tipo),
          }
        : diag,
    );

    return {
      ...currentForm,
      diagnosticos: isTipoPrincipal(draft.tipo)
        ? normalizeDiagnosticosPrincipal(nextDiagnosticos, editingIndex)
        : nextDiagnosticos,
    };
  };

  const buildDiagnosticoPayload = (diag: DiagnosticoDTO): DiagnosticoDTO => {
    const tipo = normalizeTipoDiagnostico(diag.tipo);
    const fechaInicio = normalizeLocalDateTime(diag.fechaInicio);
    const fechaFin = normalizeLocalDateTime(diag.fechaFin);
    const cie10Descripcion = diag.cie10?.descripcion?.trim() || "";
    const descripcion = diag.descripcion?.trim() || cie10Descripcion;

    return {
      id: typeof diag.id === "number" ? diag.id : undefined,
      descripcion,
      tratamiento: diag.tratamiento?.trim() || "",
      cie10:
        diag.cie10?.codigo || diag.cie10?.descripcion
          ? {
              codigo: diag.cie10?.codigo?.trim() || "",
              descripcion: diag.cie10?.descripcion?.trim() || "",
            }
          : undefined,
      principal: tipo === "PRINCIPAL",
      tipo,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
    };
  };

  const buildPayloadFromForm = (currentForm: HistoriaClinicaPayload): HistoriaClinicaPayload => {
    const diagnosticos = currentForm.diagnosticos
      .map((diag) => {
        const payload = buildDiagnosticoPayload(diag);
        const diagnosticoPayload: DiagnosticoPayloadCompat = {
          ...payload,
          descripcion: payload.descripcion?.trim() || "",
          tratamiento: payload.tratamiento?.trim() || "",
          principal: payload.tipo === "PRINCIPAL",
          fecha_inicio: payload.fechaInicio,
          fecha_fin: payload.fechaFin,
        };

        return diagnosticoPayload;
      })
      .filter(
        (diag) =>
          diag.descripcion ||
          diag.tratamiento ||
          diag.cie10?.codigo ||
          diag.cie10?.descripcion ||
          diag.principal ||
          diag.fechaInicio ||
          diag.fechaFin,
      );

    return {
      motivoConsulta: currentForm.motivoConsulta.trim(),
      antecedentesFamiliares: currentForm.antecedentesFamiliares?.trim() || "",
      antecedentesPersonales: currentForm.antecedentesPersonales?.trim() || "",
      contextoSocial: currentForm.contextoSocial?.trim() || "",
      actividadesVidaDiaria: currentForm.actividadesVidaDiaria?.trim() || "",
      objetivosTerapeuticos: currentForm.objetivosTerapeuticos?.trim() || "",
      activa: currentForm.activa ?? true,
      medicacion: currentForm.medicacion?.trim() || "",
      consumo: currentForm.consumo?.trim() || "",
      tratamientosAnteriores: currentForm.tratamientosAnteriores?.trim() || "",
      observaciones: currentForm.observaciones?.trim() || "",
      evaluaciones: currentForm.evaluaciones.map((evaluacion) => ({
        ...evaluacion,
        resultado: evaluacion.resultado?.trim() || "",
        respuestas: evaluacion.respuestas?.trim() || "",
      })),
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

    setSaving(true);
    try {
      if (exists) {
        await updateHistoriaClinica(pacienteId, payload);
      } else {
        const created = await createHistoriaClinica(pacienteId, payload);
        setExists(true);
        setHistoriaClinicaId(parseOptionalNumber(created.id) ?? null);
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

    if (!exists) {
      setForm(nextForm);
    }

    if (exists) {
      if (!historiaClinicaId) {
        setSubmitError("No se pudo identificar la historia clínica para guardar el diagnóstico.");
        return;
      }

      try {
        const draftPayload = buildDiagnosticoPayload(diagnosticoDraft);
        let savedDiagnostico: DiagnosticoDTO;

        if (typeof diagnosticoDraft.id === "number") {
          savedDiagnostico = await actualizarDiagnostico(diagnosticoDraft.id, draftPayload);
        } else {
          savedDiagnostico = await crearDiagnosticoEnHistoria(historiaClinicaId, draftPayload);
        }

        const normalizedSaved = buildDiagnosticoFromRecord(
          savedDiagnostico as Record<string, unknown>,
        );

        setForm((prev) => ({
          ...prev,
          diagnosticos: typeof diagnosticoDraft.id === "number"
            ? prev.diagnosticos.map((diag) =>
                diag.id === diagnosticoDraft.id ? normalizedSaved : diag,
              )
            : [
                ...prev.diagnosticos.filter((diag) => typeof diag.id === "number"),
                normalizedSaved,
              ],
        }));

        closeDiagnosticoModal();
        void reloadHistoriaClinica().catch((reloadError) => {
          console.error("No se pudo recargar la historia clínica", reloadError);
        });
        return;
      } catch (diagnosticoError) {
        console.error("No se pudo guardar el diagnóstico", diagnosticoError);
        setSubmitError("No se pudo guardar el diagnóstico. Intente nuevamente.");
        return;
      }
    }

    closeDiagnosticoModal();
  };

  const addDiagnostico = () => {
    setEditingIndex(null);
    setDiagnosticoDraft({
      ...createEmptyDiagnostico(),
      principal: form.diagnosticos.length === 0,
      tipo: form.diagnosticos.length === 0 ? "PRINCIPAL" : "SECUNDARIO",
    });
    setModalMode("create");
    setDiagnosticoModalVisible(true);
  };

  const removeDiagnostico = (index: number) => {
    setForm((prev) => {
      const next = prev.diagnosticos.filter((_, currentIndex) => currentIndex !== index);
      if (next.length === 1 && !next.some((diag) => diag.principal)) {
        next[0] = {
          ...next[0],
          principal: true,
          tipo: "PRINCIPAL",
        };
      }
      return {
        ...prev,
        diagnosticos: next,
      };
    });
    setEditingIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
    if (editingIndex === index) {
      setDiagnosticoModalVisible(false);
      setModalMode("view");
      setDiagnosticoDraft(null);
    }
  };

  const removeDiagnosticoFromList = async (index: number) => {
    const diagnostico = form.diagnosticos[index];

    if (exists && typeof diagnostico?.id === "number") {
      try {
        await eliminarDiagnostico(diagnostico.id);
        removeDiagnostico(index);
        await reloadHistoriaClinica();
      } catch (deleteError) {
        console.error("No se pudo eliminar el diagnóstico", deleteError);
        setSubmitError("No se pudo eliminar el diagnóstico. Intente nuevamente.");
      }
      return;
    }

    removeDiagnostico(index);
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
    diagnosticoModalVisible,
    editingIndex,
    error,
    editDiagnostico,
    exists,
    form,
    historiaClinicaId,
    handleDiagnosticoDraftChange,
    handleSubmit,
    loading,
    modalMode,
    openDiagnosticoModal,
    pageTitle,
    pacienteId,
    pacienteNombre,
    removeDiagnostico,
    saveDiagnosticoDraft,
    saving,
    selectedDiagnostico,
    setDiagnosticoDraft,
    setForm,
    setModalMode,
    reloadHistoriaClinica,
    removeDiagnosticoFromList,
    submitError,
  };
}
