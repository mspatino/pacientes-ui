import { useEffect, useRef } from "react";
import { CButton, CButtonGroup } from "@coreui/react";
import {
  BsCalendar3,
  BsChevronLeft,
  BsChevronRight,
  BsPlusLg,
} from "react-icons/bs";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import AgendaDiaPage from "./AgendaDiaPage";
import AgendaSemanaPage from "./AgendaSemanaPage";
import AgendaMesPage from "./AgendaMesPage";

import type { AgendaViewMode } from "./agenda.types";

import {
  formatDateInput,
  formatDateLabel,
  formatMonthName,
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

  const selectedDate = queryDate || formatDateInput(new Date());

  const viewMode: AgendaViewMode =
    queryView === "week" || queryView === "month" ? queryView : "day";

  // const [refreshKey, setRefreshKey] = useState(0);
  const refreshKey =
    location.state && typeof location.state === "object"
      ? (location.state.refreshAt ?? 0)
      : 0;

  const dateInputRef = useRef<HTMLInputElement>(null);

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
        ? `Semana ${formatDateLabel(selectedDate)}`
        : `${formatMonthName(selectedDate)} ${formatYearNumber(selectedDate)}`;

  const handleShift = (direction: -1 | 1) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      const currentDate = prev.get("fecha") || formatDateInput(new Date());

      let newDate = currentDate;

      if (viewMode === "month") {
        newDate = shiftDateByMonths(currentDate, direction);
      } else if (viewMode === "week") {
        newDate = shiftDateByDays(currentDate, 7 * direction);
      } else {
        newDate = shiftDateByDays(currentDate, direction);
      }

      next.set("fecha", newDate);

      return next;
    });
  };

  return (
    <div className="p-3">
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div
          className="border rounded-4 p-2 mb-2"
          style={{
            background:
              "linear-gradient(135deg, #F7FBFF 0%, #EEF5FD 55%, #E4EEF9 100%)",
            borderColor: "#D5E5F6",
          }}
        >
          <div className="d-flex flex-column gap-2">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <BsCalendar3
                  color={sipacBlue}
                  size={20}
                  className="flex-shrink-0"
                />

                <div className="d-flex align-items-baseline gap-3 flex-wrap">
                  <h3
                    className="fw-semibold mb-0"
                    style={{
                      color: "#2D3748",
                      fontSize: "0.95rem",
                    }}
                  >
                    Agenda
                  </h3>
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{
                      padding: "0.28rem 0.65rem",
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg, #F4F9FF 0%, #E7F0FB 100%)",
                      border: "1px solid #D7E6F5",
                      boxShadow: "0 2px 8px rgba(47,111,179,0.08)",
                    }}
                  >
                    <span
                      style={{
                        color: "#2F6FB3",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}
                    >
                      {formatMonthName(selectedDate)}
                    </span>

                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        backgroundColor: "#93C5FD",
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        color: "#2F6FB3",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        letterSpacing: "0.03em",
                        lineHeight: 1,
                      }}
                    >
                      {formatYearNumber(selectedDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* <CButtonGroup>
                <CButton
                  color={viewMode === "day" ? "primary" : "secondary"}
                  variant={viewMode === "day" ? undefined : "outline"}
                  style={{
                    padding: "0.22rem 0.55rem",
                    fontSize: "0.8rem",
                  }}
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("view", "day");
                      return next;
                    })
                  }
                >
                  Día
                </CButton>

                <CButton
                  color={viewMode === "week" ? "primary" : "secondary"}
                  variant={viewMode === "week" ? undefined : "outline"}
                  style={{
                    padding: "0.22rem 0.55rem",
                    fontSize: "0.8rem",
                  }}
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("view", "week");
                      return next;
                    })
                  }
                >
                  Semana
                </CButton>

                <CButton
                  color={viewMode === "month" ? "primary" : "secondary"}
                  variant={viewMode === "month" ? undefined : "outline"}
                  style={{
                    padding: "0.22rem 0.55rem",
                    fontSize: "0.8rem",
                  }}
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("view", "month");
                      return next;
                    })
                  }
                >
                  Mes
                </CButton>
              </CButtonGroup> */}
              <CButtonGroup
                style={{
                  padding: 4,
                  borderRadius: 14,

                  background:
                    "linear-gradient(135deg, #F7FBFF 0%, #EAF3FC 100%)",

                  border: "1px solid #D8E6F5",

                  boxShadow: "0 2px 10px rgba(47,111,179,0.08)",

                  marginRight: "1rem",
                }}
              >
                <CButton
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("view", "day");
                      return next;
                    })
                  }
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "0.32rem 0.9rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    backgroundColor:
                      viewMode === "day" ? "#2F6FB3" : "transparent",
                    color: viewMode === "day" ? "#FFFFFF" : "#47637F",
                    transition: "all 0.18s ease",
                    boxShadow:
                      viewMode === "day"
                        ? "0 2px 8px rgba(47,111,179,0.22)"
                        : "none",
                  }}
                >
                  Día
                </CButton>

                <CButton
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("view", "week");
                      return next;
                    })
                  }
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "0.32rem 0.9rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    backgroundColor:
                      viewMode === "week" ? "#2F6FB3" : "transparent",
                    color: viewMode === "week" ? "#FFFFFF" : "#47637F",
                    transition: "all 0.18s ease",
                    boxShadow:
                      viewMode === "week"
                        ? "0 2px 8px rgba(47,111,179,0.22)"
                        : "none",
                  }}
                >
                  Semana
                </CButton>

                <CButton
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("view", "month");
                      return next;
                    })
                  }
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "0.32rem 0.9rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    backgroundColor:
                      viewMode === "month" ? "#2F6FB3" : "transparent",
                    color: viewMode === "month" ? "#FFFFFF" : "#47637F",
                    transition: "all 0.18s ease",
                    boxShadow:
                      viewMode === "month"
                        ? "0 2px 8px rgba(47,111,179,0.22)"
                        : "none",
                  }}
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
                  onClick={() => handleShift(-1)}
                  className="d-flex align-items-center justify-content-center border-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    flexShrink: 0,
                    padding: 0,
                    background:
                      "linear-gradient(135deg, #F4F9FF 0%, #E6F0FB 100%)",
                    color: "#2F6FB3",
                    boxShadow: "0 2px 8px rgba(47,111,179,0.12)",
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #E8F1FB 0%, #D9E9FA 100%)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #F4F9FF 0%, #E6F0FB 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <BsChevronLeft size={15} />
                </CButton>
                {/* DATEPICKER CUSTOM */}
                <div
                  onClick={() => dateInputRef.current?.showPicker()}
                  className="d-flex align-items-center justify-content-center gap-3 fw-semibold text-capitalize"
                  style={{
                    position: "relative",
                    minWidth: 210,
                    padding: "0.32rem 0.7rem",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)",
                    border: "1px solid #D8E6F5",
                    boxShadow: "0 4px 14px rgba(47,111,179,0.08)",
                    color: "#2F6FB3",
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                  }}
                >
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate}
                    onChange={
                      (e) =>
                        setSearchParams((prev) => {
                          const next = new URLSearchParams(prev);
                          next.set("fecha", e.target.value);
                          return next;
                        })
                      // setSelectedDate(e.target.value)
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
                    <BsCalendar3 size={14} />
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
                  onClick={() => handleShift(1)}
                  className="d-flex align-items-center justify-content-center border-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    flexShrink: 0,
                    padding: 0,
                    background:
                      "linear-gradient(135deg, #F4F9FF 0%, #E6F0FB 100%)",
                    color: "#2F6FB3",
                    boxShadow: "0 2px 8px rgba(47,111,179,0.12)",
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #E8F1FB 0%, #D9E9FA 100%)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #F4F9FF 0%, #E6F0FB 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <BsChevronRight size={15} />
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
                    borderRadius: "10px",
                    padding: "0.3rem 0.65rem",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(47,111,179,0.10)",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: sipacBlue,
                      color: "white",
                      fontSize: "0.65rem",
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
          <AgendaDiaPage selectedDate={selectedDate} refreshKey={refreshKey} />
        ) : null}
        {viewMode === "week" ? (
          <AgendaSemanaPage
            selectedDate={selectedDate}
            refreshKey={refreshKey}
          />
        ) : null}
        {viewMode === "month" ? (
          <AgendaMesPage selectedDate={selectedDate} refreshKey={refreshKey} />
        ) : null}
      </div>
    </div>
  );
}
