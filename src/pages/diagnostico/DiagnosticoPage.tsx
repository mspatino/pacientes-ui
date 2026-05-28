import { useState } from "react";
import {
  CForm,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
} from "@coreui/react";
import DiagnosticoAutocompleteFields from "../../components/historia_clinica/diagnosticos/DiagnosticoAutocompleteFields";
import type { Cie10DTO } from "../../api/diagnosticos";

export default function DiagnosticoPage() {
  const [descripcion, setDescripcion] = useState("");
  const [cie10, setCie10] = useState<Cie10DTO | null>(null);

  const guardar = async () => {
    if (!descripcion.trim()) {
      alert("Por favor ingresa una descripción");
      return;
    }

    const payload = {
      descripcion,
      cie10Codigo: cie10?.codigo || null,
      principal: false,
    };

    try {
      const res = await fetch("/api/diagnosticos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Diagnóstico guardado exitosamente");
        setDescripcion("");
        setCie10(null);
      } else {
        alert("Error al guardar el diagnóstico");
      }
    } catch (error) {
      console.error("Error guardando diagnóstico", error);
      alert("Error al guardar el diagnóstico");
    }
  };

  return (
    <div className="p-3">
      <CCard>
        <CCardHeader>Alta de Diagnóstico</CCardHeader>
        <CCardBody>
          <CForm>
            <CRow>
              <CCol md={12}>
                <DiagnosticoAutocompleteFields
                  descripcion={descripcion}
                  cie10={cie10}
                  onDescripcionChange={setDescripcion}
                  onCie10Change={setCie10}
                  descripcionLabel="Descripción clínica"
                  descripcionPlaceholder="Describí el diagnóstico clínico"
                  fillDescriptionFromCie10={false}
                  clearCie10OnDescriptionEdit={false}
                />
              </CCol>

              <CCol md={12} className="mt-4">
                <CButton color="primary" onClick={guardar} disabled={!descripcion.trim()}>
                  Guardar Diagnóstico
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
}
