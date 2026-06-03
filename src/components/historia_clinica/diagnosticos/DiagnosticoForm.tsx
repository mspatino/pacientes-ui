import {
    CButton,
    CCol,
    CFormInput,
    CFormLabel,
    CFormTextarea,
    CRow,
} from "@coreui/react";

import { useEffect, useRef, useState } from "react";
import { BsClockHistory, BsPlusLg } from "react-icons/bs";

import type {
    Cie10DTO,
    DiagnosticoDTO,
} from "../../../api/pacientes";
import { crearEvolucionDiagnostico } from "../../../api/pacientes";

import DiagnosticoAutocompleteFields from "./DiagnosticoAutocompleteFields";
import EvolucionDiagnosticoCard from "./EvolucionDiagnosticoCard";
import EvolucionModal from "./EvolucionModal";

import {
    autoResizeTextarea,
    formatFechaHora,
    getDiagnosticoFechaFin,
    getDiagnosticoFechaInicio,
    getDiagnosticoTipoLabel,
    normalizeTipoDiagnostico,
    resolverTipoAutomatico,
} from "./diagnosticoUtils";
import DiagnosticoTipoSelect from "./DiagnosticoTipoSelect";

interface Props {
    diagnostico: DiagnosticoDTO;
    editingIndex: number | null;
    isEditing: boolean;
    onDraftChange: (
        field: keyof DiagnosticoDTO,
        value: string | boolean | Cie10DTO | null,
    ) => void;
    reloadDiagnostico?: () => void | Promise<void>;
}

export default function DiagnosticoForm({
    diagnostico,
    isEditing,
    onDraftChange,
    reloadDiagnostico,
}: Props) {

    const tratamientoRef = useRef<HTMLTextAreaElement>(null);
    const [modalVisible, setModalVisible] = useState(false);
    // const [createdEvoluciones, setCreatedEvoluciones] = useState<
    //     Record<number, EvolucionDiagnosticoDTO[]>
    // >({});
    //const [tipoEditadoManual, setTipoEditadoManual] = useState(false);
    const tipoEditadoManualRef = useRef(false);

    const evoluciones = diagnostico.evoluciones ?? [];
    const descripcion = diagnostico.descripcion?.trim() ?? "";
    const cie10Codigo = diagnostico.cie10?.codigo?.trim() ?? "";
    const cie10Descripcion = diagnostico.cie10?.descripcion?.trim() ?? "";
    const diagnosticoTitulo = cie10Codigo
        ? [cie10Codigo, cie10Descripcion || descripcion].filter(Boolean).join(" ")
        : descripcion ||
        "Sin diagnóstico";
    const fechaInicio = formatFechaHora(getDiagnosticoFechaInicio(diagnostico));
    const fechaFin = formatFechaHora(getDiagnosticoFechaFin(diagnostico));

    useEffect(() => {
        if (!isEditing) return;

        if (tratamientoRef.current) {
            autoResizeTextarea(tratamientoRef.current);
        }

    }, [
        isEditing,
        diagnostico.tratamiento,
    ]);

    const handleTipoChange = (value: DiagnosticoDTO["tipo"]) => {
        //setTipoEditadoManual(true);
        tipoEditadoManualRef.current = true;
        onDraftChange("tipo", normalizeTipoDiagnostico(value));
    };

    const handleCie10Change = (nuevoCie10: Cie10DTO | null) => {
        onDraftChange("cie10", nuevoCie10);

        if (!nuevoCie10) {
            tipoEditadoManualRef.current = false;
        }

        if (!tipoEditadoManualRef.current) {
        onDraftChange(
            "tipo",
            resolverTipoAutomatico(
                nuevoCie10?.codigo,
            ),
        );
    }
    };

    const handleSaveEvolucion = async (
    nota: string,
) => {

    const diagnosticoId = diagnostico.id;

    if (!diagnosticoId) return;

    await crearEvolucionDiagnostico(
        diagnosticoId,
        nota,
    );

    setModalVisible(false);

    await reloadDiagnostico?.();
};

    const showEvolucionesSection = evoluciones.length > 0 || (isEditing && diagnostico.id);

    const evolucionesSection = showEvolucionesSection ? (
        <div className="sipac-seguimiento-mini sipac-seguimiento-editor">
            <div className="sipac-seguimiento-header">
                <span className="sipac-section-icon">
                    <BsClockHistory size={12} />
                </span>

                <span className="sipac-seguimiento-title">
                    Seguimiento clínico
                </span>

                {isEditing && diagnostico.id ? (
                    // <CButton
                    //     type="button"
                    //     className="sipac-toolbar-btn sipac-evolucion-add-btn"
                    //     onClick={() => setModalVisible(true)}
                    // >
                    //     <BsPlusLg size={11} />
                    //     Evolución
                    // </CButton>
                    <CButton
                        type="button"
                        className="hc-action-btn hc-action-btn-sm d-flex align-items-center gap-1"
                        onClick={() => setModalVisible(true)}
                        >
                        <BsPlusLg size={13} />
                        Evolución
                        </CButton>
                ) : null}
            </div>

            {evoluciones.length > 0 ? (
                <div className="sipac-seguimiento-list">
                    {evoluciones.map((evolucion, index) => (
                        <EvolucionDiagnosticoCard
                            key={evolucion.id ?? `${evolucion.fecha ?? "evolucion"}-${index}`}
                            evolucion={evolucion}
                        />
                    ))}
                </div>
            ) : null}

            {isEditing ? (
                <EvolucionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSaveEvolucion}
                />
            ) : null}
        </div>
    ) : null;

    if (isEditing) {
        return (
            <CRow className="g-3">

                <CCol md={12}>
                    <DiagnosticoAutocompleteFields
                        descripcion={diagnostico.descripcion || ""}
                        cie10={diagnostico.cie10 || null}
                        onDescripcionChange={(value) =>
                            onDraftChange("descripcion", value)
                        }
                        onCie10Change={handleCie10Change}
                        descripcionLabel="Descripción clínica"
                        descripcionPlaceholder="Describí el diagnóstico clínico"
                        descripcionRows={1}
                        fillDescriptionFromCie10
                        clearCie10OnDescriptionEdit={false}
                    />
                </CCol>

                <CCol md={diagnostico.id ? 6 : 12}>
                    <DiagnosticoTipoSelect
                        className=""
                        value={normalizeTipoDiagnostico(diagnostico.tipo)}
                        onChange={handleTipoChange}
                    />
                </CCol>

                {diagnostico.id ? (
                    <CCol md={6}>
                        <CFormLabel className="sipac-label">Fecha fin</CFormLabel>

                        <CFormInput
                            className="sipac-input"
                            type="datetime-local"
                            value={diagnostico.fechaFin || ""}
                            onChange={(e) =>
                                onDraftChange("fechaFin", e.target.value)
                            }
                        />
                    </CCol>
                ) : null}

                <CCol md={12}>
                    <CFormLabel className="sipac-label">Tratamiento</CFormLabel>

                    <CFormTextarea
                        className="sipac-input"
                        ref={tratamientoRef}
                        rows={1}
                        style={{
                            resize: "none",
                            overflow: "hidden",
                        }}
                        value={diagnostico.tratamiento || ""}
                        onInput={(e) =>
                            autoResizeTextarea(e.currentTarget)
                        }
                        onChange={(e) =>
                            onDraftChange("tratamiento", e.target.value)
                        }
                    />
                </CCol>

                <CCol md={12}>
                    {evolucionesSection}
                </CCol>
            </CRow>
        );
    }

    return (
        <div className="d-flex flex-column gap-3 sipac-diagnostico-compact">

            <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                {diagnostico.tipo ? (
                    <span
                        className="badge rounded-pill"
                        style={{
                            fontSize: "0.68rem",
                            padding: "0.18rem 0.45rem",
                            backgroundColor: "#EEF4FF",
                            color: "#2F6FB3",
                            border: "1px solid #D7E6FB",
                        }}
                    >
                        {getDiagnosticoTipoLabel(diagnostico.tipo)}
                    </span>
                ) : (
                    <span />
                )}

                <div className="sipac-diagnostico-fechas d-flex align-items-center gap-2 flex-wrap text-body-secondary">
                    {fechaInicio ? (
                        <span>
                            <span
                                className="badge rounded-pill me-1"
                                style={{
                                    backgroundColor: "#F6F8F6",
                                    color: "#6C8A6D",
                                    border: "1px solid #DCE6DC",
                                }}
                            >
                                Inicio
                            </span>

                            {fechaInicio}
                        </span>
                    ) : null}

                    {fechaFin ? (
                        <span>
                            <span
                                className="badge rounded-pill me-1"
                                style={{
                                    backgroundColor: "#FAF8F5",
                                    color: "#9A7B5F",
                                    border: "1px solid #E8DDD2",
                                }}
                            >
                                Alta
                            </span>

                            {fechaFin}
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="sipac-diagnostico-title">
                {diagnosticoTitulo}
            </div>

            {diagnostico.tratamiento?.trim() ? (
                <div>
                    <div className="small text-muted">
                        Tratamiento
                    </div>

                    <div>
                        {diagnostico.tratamiento}
                    </div>
                </div>
            ) : null}

            {evolucionesSection}

        </div>
    );
}
