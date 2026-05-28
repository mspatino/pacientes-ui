import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CButton,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CListGroup,
  CListGroupItem,
} from "@coreui/react";
import { autocompleteDiagnosticos, type Cie10DTO } from "../../../api/diagnosticos";

interface DiagnosticoAutocompleteFieldsProps {
  descripcion: string;
  cie10?: Cie10DTO | null;
  onDescripcionChange: (value: string) => void;
  onCie10Change: (value: Cie10DTO | null) => void;
  descripcionLabel?: string;
  descripcionPlaceholder?: string;
  descripcionRows?: number;
  searchLabel?: string;
  searchPlaceholder?: string;
  fillDescriptionFromCie10?: boolean;
  clearCie10OnDescriptionEdit?: boolean;
  afterSearch?: ReactNode;
}

const PAGE_SIZE = 10;

const autoResizeTextarea = (element: HTMLTextAreaElement) => {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
};

export default function DiagnosticoAutocompleteFields({
  descripcion,
  cie10,
  onDescripcionChange,
  onCie10Change,
  descripcionLabel = "Diagnóstico",
  descripcionPlaceholder = "Describe el diagnóstico aquí",
  descripcionRows = 3,
  searchLabel = "Buscar CIE-10",
  searchPlaceholder = "Ej: F32, ansiedad",
  fillDescriptionFromCie10 = true,
  clearCie10OnDescriptionEdit = true,
  afterSearch,
}: DiagnosticoAutocompleteFieldsProps) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Cie10DTO[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [descripcion]);

  useEffect(() => {
    if (cie10?.codigo && cie10?.descripcion) {
      setBusqueda(`${cie10.codigo} - ${cie10.descripcion}`);
      return;
    }

    if (cie10?.codigo) {
      setBusqueda(cie10.codigo);
      return;
    }

    if (!cie10?.codigo && !descripcion) {
      setBusqueda("");
    }
  }, [cie10, descripcion]);

  const limpiarResultados = () => {
    setResultados([]);
    setSelectedIndex(null);
    setPage(0);
    setHasMore(false);
  };

  const buscarCie10 = async (value: string, nextPage = 0) => {
    setBusqueda(value);

    const isCodigo = /^[A-Za-z][0-9]/.test(value);

    if (!isCodigo && value.length < 3) {
      limpiarResultados();
      return;
    }

    if (isCodigo && value.length < 2) {
      limpiarResultados();
      return;
    }

    setLoading(true);

    try {
      const data = await autocompleteDiagnosticos(value, nextPage, PAGE_SIZE);

      if (nextPage === 0) {
        setResultados(data);
        setSelectedIndex(data.length > 0 ? 0 : null);
      } else {
        setResultados((prev) => [...prev, ...data]);
      }

      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error buscando CIE10", error);
      limpiarResultados();
    } finally {
      setLoading(false);
    }
  };

  const seleccionar = (item: Cie10DTO) => {
    if (fillDescriptionFromCie10) {
      onDescripcionChange(item.descripcion);
    }
    onCie10Change(item);
    setBusqueda(`${item.codigo} - ${item.descripcion}`);
    limpiarResultados();
  };

  const cambiarDescripcion = (value: string) => {
    onDescripcionChange(value);
    if (clearCie10OnDescriptionEdit && cie10?.codigo) {
      onCie10Change(null);
    }
  };

  const quitarCie10 = () => {
    onCie10Change(null);
    setBusqueda("");
    limpiarResultados();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (resultados.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === null || prev >= resultados.length - 1 ? 0 : prev + 1,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === null || prev <= 0 ? resultados.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex !== null && resultados[selectedIndex]) {
        seleccionar(resultados[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      limpiarResultados();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const reachedBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 8;

    if (!reachedBottom || loading || !hasMore || !busqueda.trim()) {
      return;
    }

    void buscarCie10(busqueda, page + 1);
  };

  return (
    <>
      <div>
        <CFormLabel className="sipac-label">{descripcionLabel}</CFormLabel>
        <CFormTextarea
          ref={textareaRef}
          value={descripcion}
          onChange={(e) => cambiarDescripcion(e.target.value)}
          onInput={(e) => autoResizeTextarea(e.currentTarget)}
          placeholder={descripcionPlaceholder}
          rows={descripcionRows}
          style={{ resize: "none", overflow: "hidden" }}
          className="sipac-input"
        />
      </div>

      <div>
        <CFormLabel className="mb-2 sipac-label">{searchLabel}</CFormLabel>
        <div className="d-flex gap-2 align-items-start">
          <CFormInput
            className="sipac-input"
            ref={inputRef}
            placeholder={searchPlaceholder}
            value={busqueda}
            onChange={(e) => buscarCie10(e.target.value)}
            onKeyDown={handleKeyDown}
            title={busqueda}
            style={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          />
          {cie10?.codigo ? (
   <CButton
    type="button"
    size="sm"
    className="sipac-toolbar-btn px-3"
    onClick={quitarCie10}
    title="Quitar CIE-10"
  >
    X
  </CButton>
          ) : null}
        </div>
      </div>

      {afterSearch ? <div>{afterSearch}</div> : null}

      {resultados.length > 0 ? (
        <div onScroll={handleScroll} style={{ maxHeight: 300, overflowY: "auto" }}>
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
          {loading ? (
            <div className="text-center py-2 text-body-secondary">
              Cargando más resultados...
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
