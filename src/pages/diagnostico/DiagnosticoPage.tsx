import { useState, useRef } from "react";
import {
  CForm,
  CFormTextarea,
  CFormInput,
  CFormLabel,
  CListGroup,
  CListGroupItem,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
} from "@coreui/react";
import { autocompleteDiagnosticos } from "../../api/diagnosticos";

interface Cie10Item {
  codigo: string;
  descripcion: string;
}

export default function DiagnosticoPage() {
  const [descripcion, setDescripcion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Cie10Item[]>([]);
  const [cie10, setCie10] = useState<Cie10Item | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const buscarCie10 = async (value: string) => {
    setBusqueda(value);

    const isCodigo = /^[A-Za-z][0-9]/.test(value);

    if (!isCodigo && value.length < 3) {
      setResultados([]);
      setSelectedIndex(null);
      return;
    }

    if (isCodigo && value.length < 2) {
      setResultados([]);
      setSelectedIndex(null);
      return;
    }

    try {
      const data = await autocompleteDiagnosticos(value);
      setResultados(data);
      setSelectedIndex(data.length > 0 ? 0 : null);
    } catch (error) {
      console.error("Error buscando CIE10", error);
      setResultados([]);
      setSelectedIndex(null);
    }
  };

  const seleccionar = (item: Cie10Item) => {
    setDescripcion(item.descripcion);
    setCie10(item);
    setBusqueda(`${item.codigo} - ${item.descripcion}`);
    setResultados([]);
    setSelectedIndex(null);
    // Ajustar height después de cambiar descripción
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 0);
  };

  const cambiarDescripcion = (value: string) => {
    setDescripcion(value);
    if (cie10) {
      setCie10(null);
    }
    // Ajustar height
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 0);
  };

  const quitarCie10 = () => {
    setCie10(null);
    setBusqueda("");
    setDescripcion("");
    setResultados([]);
    setSelectedIndex(null);
    // Ajustar height
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (resultados.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === null || prev >= resultados.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === null || prev <= 0 ? resultados.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex !== null && resultados[selectedIndex]) {
        seleccionar(resultados[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setResultados([]);
      setSelectedIndex(null);
    }
  };

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
        setBusqueda("");
        setCie10(null);
        setResultados([]);
        setSelectedIndex(null);
        // Ajustar height
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
          }
        }, 0);
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
                <CFormInput
                  label="Diagnóstico"
                  value={descripcion}
                  onChange={(e) => cambiarDescripcion(e.target.value)}
                  placeholder="Describe el diagnóstico aquí"
                />
              </CCol>

              <CCol md={12}>
                <CFormLabel className="mt-4 mb-2">
                  Buscar sugerencias en CIE-10 (opcional)
                </CFormLabel>

                <div className="d-flex gap-2 align-items-start mt-2">
                  <CFormInput
                    ref={inputRef}
                    placeholder="Ej: ansiedad, F32..."
                    value={busqueda}
                    onChange={(e) => buscarCie10(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {cie10 ? (
                    <CButton size="sm" color="danger" variant="outline" onClick={quitarCie10}>
                      Quitar
                    </CButton>
                  ) : null}
                </div>
              </CCol>

              {resultados.length > 0 && (
                <CCol md={12} className="mt-3">
                  <CListGroup>
                    {resultados.map((item, index) => (
                      <CListGroupItem
                        key={item.codigo}
                        onClick={() => seleccionar(item)}
                        style={{ cursor: "pointer" }}
                        className={`${
                          selectedIndex === index
                            ? "bg-primary text-white"
                            : "text-blue-600 hover:bg-gray-100"
                        }`}
                      >
                        {item.codigo} - {item.descripcion}
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                </CCol>
              )}

              <CCol md={12} className="mt-4">
                <CButton
                  color="primary"
                  onClick={guardar}
                  disabled={!descripcion.trim()}
                >
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