import {
    CButton,
    CCol,
    CFormInput,
    CFormLabel,
    CFormTextarea,
    CRow,
} from "@coreui/react";

import { useEffect, useRef, useState } from "react";

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

    const evolucionesSection = (
        <>
            {diagnostico.id ? (
                <div>
                    <CButton
                        type="button"
                        className="sipac-toolbar-btn"
                        onClick={() => setModalVisible(true)}
                    >
                        + Evolución
                    </CButton>
                </div>
            ) : null}

            {evoluciones.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                    {evoluciones.map((evolucion, index) => (
                        <EvolucionDiagnosticoCard
                            key={evolucion.id ?? `${evolucion.fecha ?? "evolucion"}-${index}`}
                            evolucion={evolucion}
                        />
                    ))}
                </div>
            ) : null}

            <EvolucionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveEvolucion}
            />
        </>
    );

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
                        fillDescriptionFromCie10={false}
                        clearCie10OnDescriptionEdit={false}
                        afterSearch={
                            <DiagnosticoTipoSelect
                                className="col-md-4 mt-3"
                                value={normalizeTipoDiagnostico(diagnostico.tipo)}
                                onChange={handleTipoChange}
                            />
                        }
                    />
                </CCol>

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
                    {evolucionesSection}
                </CCol>
            </CRow>
        );
    }

    return (
        <div className="d-flex flex-column gap-3">

            <div className="d-flex justify-content-between align-items-start">
                <div className="small text-body-secondary">
                    {diagnostico.fechaInicio
                        ? formatFechaHora(diagnostico.fechaInicio)
                        : ""}
                </div>
            </div>

            <div className="fw-semibold fs-5">
                {diagnostico.descripcion}
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
