import { useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CRow,
} from "@coreui/react";
import {
  BsActivity,
  BsBarChart,
  BsCalendar2Check,
  BsClipboard2Pulse,
  BsExclamationTriangle,
  BsPeople,
} from "react-icons/bs";

import {
  getEstadisticasResumen,
  type CantidadPorCategoria,
  type EstadisticasResumen,
} from "../../api/estadisticas";

const formatMonthInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || "No se pudieron cargar las estadísticas";
  }

  return "No se pudieron cargar las estadísticas";
};

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <CCol xs={12} sm={6} lg={4}>
      <CCard className="h-100 border-0 shadow-sm" style={{ borderRadius: 8 }}>
        <CCardBody className="d-flex align-items-center gap-3 p-3">
          <span
            className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              color: tone,
              backgroundColor: `${tone}18`,
            }}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <div className="text-uppercase text-muted fw-semibold" style={{ fontSize: "0.68rem" }}>
              {label}
            </div>
            <div className="fw-semibold" style={{ fontSize: "1.25rem", color: "#263238" }}>
              {value}
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  );
}

function SimpleBarList({
  title,
  items,
}: {
  title: string;
  items: CantidadPorCategoria[];
}) {
  const max = Math.max(...items.map((item) => item.cantidad), 0);

  return (
    <CCard className="h-100 border-0 shadow-sm" style={{ borderRadius: 8 }}>
      <CCardBody className="p-3">
        <h3 className="fw-semibold mb-3" style={{ fontSize: "0.9rem", color: "#263238" }}>
          {title}
        </h3>

        {items.length === 0 ? (
          <div className="text-muted" style={{ fontSize: "0.82rem" }}>
            Sin datos para el período
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {items.map((item) => {
              const width = max > 0 ? Math.max(6, (item.cantidad / max) * 100) : 0;

              return (
                <div key={`${item.codigo}-${item.descripcion}`}>
                  <div className="d-flex justify-content-between gap-3 mb-1">
                    <span
                      className="text-truncate"
                      title={item.descripcion}
                      style={{ fontSize: "0.8rem", color: "#37474f" }}
                    >
                      {item.descripcion}
                    </span>
                    <span className="fw-semibold" style={{ fontSize: "0.8rem" }}>
                      {item.cantidad}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 7,
                      borderRadius: 999,
                      backgroundColor: "#E8EEF5",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${width}%`,
                        height: "100%",
                        borderRadius: 999,
                        backgroundColor: "#2F6FB3",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CCardBody>
    </CCard>
  );
}

export default function EstadisticasPage() {
  const [periodo, setPeriodo] = useState(formatMonthInput(new Date()));
  const [resumen, setResumen] = useState<EstadisticasResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [anio, mes] = useMemo(
    () => periodo.split("-").map((value) => Number(value)),
    [periodo],
  );

  useEffect(() => {
    let mounted = true;

    const loadResumen = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getEstadisticasResumen(anio, mes);

        if (mounted) {
          setResumen(data);
        }
      } catch (loadError) {
        if (mounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadResumen();

    return () => {
      mounted = false;
    };
  }, [anio, mes]);

  return (
    <div className="p-3">
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
          <div>
            <h1 className="fw-semibold mb-1" style={{ fontSize: "1.05rem", color: "#263238" }}>
              Estadísticas
            </h1>
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
              {resumen ? `${formatDate(resumen.desde)} al ${formatDate(resumen.hasta)}` : "Resumen mensual"}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <CFormInput
              aria-label="Período"
              type="month"
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
              style={{ width: 150, fontSize: "0.82rem" }}
            />
            <CButton
              color="primary"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => setPeriodo(formatMonthInput(new Date()))}
            >
              Mes actual
            </CButton>
          </div>
        </div>

        {error && (
          <CAlert color="danger" className="py-2" style={{ fontSize: "0.85rem" }}>
            {error}
          </CAlert>
        )}

        <CRow className="g-3 mb-3">
          <SummaryCard
            label="Pacientes activos"
            value={resumen?.pacientesActivos ?? "-"}
            icon={<BsPeople size={18} />}
            tone="#2F6FB3"
          />
          <SummaryCard
            label="Turnos del mes"
            value={resumen?.turnosDelMes ?? "-"}
            icon={<BsCalendar2Check size={18} />}
            tone="#00897B"
          />
          <SummaryCard
            label="Ausentes del mes"
            value={resumen?.ausentesDelMes ?? "-"}
            icon={<BsExclamationTriangle size={18} />}
            tone="#C66A1A"
          />
          <SummaryCard
            label="Ausentismo"
            value={resumen ? `${resumen.porcentajeAusentismo.toFixed(2)}%` : "-"}
            icon={<BsBarChart size={18} />}
            tone="#7B5BBE"
          />
          <SummaryCard
            label="Diagnósticos frecuentes"
            value={resumen?.diagnosticosPrincipalesFrecuentes.length ?? "-"}
            icon={<BsActivity size={18} />}
            tone="#546E7A"
          />
          <SummaryCard
            label="Evaluaciones Beck"
            value={
              resumen?.evaluacionesBeckPorPaciente.reduce(
                (total, item) => total + item.cantidad,
                0,
              ) ?? "-"
            }
            icon={<BsClipboard2Pulse size={18} />}
            tone="#5E7C35"
          />
        </CRow>

        <CRow className="g-3">
          <CCol xs={12} lg={6}>
            <SimpleBarList
              title="Turnos del mes por estado"
              items={resumen?.turnosMesPorEstado ?? []}
            />
          </CCol>
          <CCol xs={12} lg={6}>
            <SimpleBarList
              title="Diagnósticos principales más frecuentes"
              items={resumen?.diagnosticosPrincipalesFrecuentes ?? []}
            />
          </CCol>
          <CCol xs={12}>
            <SimpleBarList
              title="Evaluaciones Beck por paciente"
              items={resumen?.evaluacionesBeckPorPaciente ?? []}
            />
          </CCol>
        </CRow>
      </div>
    </div>
  );
}
