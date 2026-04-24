import { useEffect, useRef, useState } from "react";
import { CButton, CButtonGroup } from "@coreui/react";
import {
  BsCalendar3,
  BsChevronLeft,
  BsChevronRight,
  BsPlusLg,
} from "react-icons/bs";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import AgendaDiaPage from "./AgendaDiaPage";
import AgendaSemanaPage from "./AgendaSemanaPage";
import AgendaMesPage from "./AgendaMesPage";

import type { AgendaViewMode } from "./agenda.types";

import {
  formatDateInput,
  formatDateLabel,
  formatMonthName,
  formatMonthTitle,
  formatYearNumber,
  shiftDateByDays,
  shiftDateByMonths,
} from "./agenda.utils";

export default function AgendaPage() {
  const sipacBlue = "#2F6FB3";

  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const queryDate = searchParams.get("fecha");
  const queryView = searchParams.get("view");

  const [viewMode, setViewMode] = useState<AgendaViewMode>(
    queryView === "week" || queryView === "month"
      ? queryView
      : "day",
  );

  const [selectedDate, setSelectedDate] = useState(
    () => queryDate || formatDateInput(new Date()),
  );

  const [refreshKey, setRefreshKey] = useState(0);

  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (queryDate) {
      setSelectedDate(queryDate);
    }

    if (
      queryView === "day" ||
      queryView === "week" ||
      queryView === "month"
    ) {
      setViewMode(queryView);
    }

    const refreshAt =
      location.state && typeof location.state === "object"
        ? location.state.refreshAt
        : undefined;

    if (typeof refreshAt === "number") {
      setRefreshKey((prev) => prev + 1);
    }
  }, [location.state, queryDate, queryView]);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      next.set("fecha", selectedDate);
      next.set("view", viewMode);

      return next;
    });
  }, [selectedDate, setSearchParams, viewMode]);

  const pageLabel =
    viewMode === "day"
      ? formatDateLabel(selectedDate)
      : viewMode === "week"
        ? `Semana de ${formatDateLabel(selectedDate)}`
        : formatMonthTitle(selectedDate);

  const handleShift = (direction: -1 | 1) => {
    if (viewMode === "month") {
      setSelectedDate((prev) =>
        shiftDateByMonths(prev, direction),
      );
      return;
    }

    if (viewMode === "week") {
      setSelectedDate((prev) =>
        shiftDateByDays(prev, 7 * direction),
      );
      return;
    }

    setSelectedDate((prev) =>
      shiftDateByDays(prev, direction),
    );
  };

  return (
    <div className="p-3">
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div
          className="border rounded-4 p-3 mb-3"
          style={{
            background:
              "linear-gradient(135deg, #F7FBFF 0%, #EEF5FD 55%, #E4EEF9 100%)",
            borderColor: "#D5E5F6",
          }}
        >
          <div className="d-flex flex-column gap-3">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

              <div className="d-flex align-items-center gap-3 flex-wrap">
                <BsCalendar3
                  color={sipacBlue}
                  size={26}
                  className="flex-shrink-0"
                />

                <div className="d-flex align-items-baseline gap-3 flex-wrap">
                  <h3
                    className="fw-semibold mb-0"
                    style={{
                      color: "#2D3748",
                      fontSize: "1.1rem",
                    }}
                  >
                    Agenda
                  </h3>

                  <div
                    className="fw-bold text-uppercase"
                    style={{
                      color: sipacBlue,
                      fontSize:
                        "clamp(0.8rem, 1.4vw, 1rem)",
                      letterSpacing: "0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {formatMonthName(selectedDate)} /{" "}
                    {formatYearNumber(selectedDate)}
                  </div>
                </div>
              </div>

              <CButtonGroup>
                <CButton
                  color={
                    viewMode === "day"
                      ? "primary"
                      : "secondary"
                  }
                  variant={
                    viewMode === "day"
                      ? undefined
                      : "outline"
                  }
                  onClick={() => setViewMode("day")}
                >
                  Día
                </CButton>

                <CButton
                  color={
                    viewMode === "week"
                      ? "primary"
                      : "secondary"
                  }
                  variant={
                    viewMode === "week"
                      ? undefined
                      : "outline"
                  }
                  onClick={() => setViewMode("week")}
                >
                  Semana
                </CButton>

                <CButton
                  color={
                    viewMode === "month"
                      ? "primary"
                      : "secondary"
                  }
                  variant={
                    viewMode === "month"
                      ? undefined
                      : "outline"
                  }
                  onClick={() => setViewMode("month")}
                >
                  Mes
                </CButton>
              </CButtonGroup>
            </div>

            {/* CONTROLES */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">

              <div className="d-flex align-items-center gap-3 flex-nowrap">

                {/* BOTON IZQUIERDA */}
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShift(-1)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                  }}
                >
                  <BsChevronLeft size={18} />
                </CButton>

                {/* DATEPICKER CUSTOM */}
                <div
                  onClick={() =>
                    dateInputRef.current?.showPicker()
                  }
                  className="d-flex align-items-center justify-content-center gap-3 fw-semibold text-capitalize"
                  style={{
                    position: "relative",
                    minWidth: 240,
                    padding: "0.45rem 0.85rem",
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)",
                    border: "1px solid #D8E6F5",
                    boxShadow:
                      "0 4px 14px rgba(47,111,179,0.08)",
                    color: "#2F6FB3",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                  }}
                >
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      setSelectedDate(e.target.value)
                    }
                    style={{
                      position: "absolute",
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "10px",
                      backgroundColor: "#E8F1FB",
                      color: sipacBlue,
                      flexShrink: 0,
                    }}
                  >
                    <BsCalendar3 size={15} />
                  </div>

                  <span
                    style={{
                      color: "#334155",
                      fontWeight: 600,
                    }}
                  >
                    {pageLabel}
                  </span>
                </div>

                {/* BOTON DERECHA */}
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShift(1)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    flexShrink: 0,
                  }}
                >
                  <BsChevronRight size={18} />
                </CButton>

                {/* BOTON NUEVO TURNO */}
                <CButton
                  onClick={() => {
                    navigate(
                      `/agenda/nuevo?fecha=${encodeURIComponent(
                        selectedDate,
                      )}&view=${viewMode}`,
                    );
                  }}
                  className="d-flex align-items-center gap-2 border-0 fw-semibold"
                  style={{
                    backgroundColor: "#E8F1FB",
                    color: sipacBlue,
                    borderRadius: "12px",
                    padding: "0.4rem 0.8rem",
                    whiteSpace: "nowrap",
                    boxShadow:
                      "0 2px 8px rgba(47,111,179,0.10)",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: sipacBlue,
                      color: "white",
                      fontSize: "0.75rem",
                      flexShrink: 0,
                    }}
                  >
                    <BsPlusLg />
                  </div>

                  <span>Agregar turno</span>
                </CButton>
              </div>
            </div>
          </div>
        </div>

        {viewMode === "day" ? (
          <AgendaDiaPage
            selectedDate={selectedDate}
            refreshKey={refreshKey}
          />
        ) : null}

        {viewMode === "week" ? (
          <AgendaSemanaPage
            selectedDate={selectedDate}
            refreshKey={refreshKey}
          />
        ) : null}

        {viewMode === "month" ? (
          <AgendaMesPage
            selectedDate={selectedDate}
            refreshKey={refreshKey}
          />
        ) : null}
      </div>
    </div>
  );
}