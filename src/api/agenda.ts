import axios from "axios";
import api from "./api";

export type EstadoTurno = "PENDIENTE" | "CONFIRMADO" | "CANCELADO" | "AUSENTE";

export interface AgendaTurno {
  id: number;
  pacienteId?: number | null;
  pacienteNombre: string;
  telefonoContacto?: string;
  fechaHora: string;
  estado: EstadoTurno;
  notas?: string;
}

export interface AgendaTurnoPayload {
  pacienteId?: number;
  pacienteNombre?: string;
  telefonoContacto?: string;
  fechaHora: string;
  estado?: EstadoTurno;
  notas?: string;
}

const mapTurno = (item: Record<string, unknown>): AgendaTurno => {
  const paciente =
    item.paciente && typeof item.paciente === "object"
      ? (item.paciente as Record<string, unknown>)
      : null;

  const apellido =
    paciente && typeof paciente.apellido === "string" ? paciente.apellido.trim() : "";
  const nombre = paciente && typeof paciente.nombre === "string" ? paciente.nombre.trim() : "";
  const pacienteNombre = [
    typeof item.pacienteNombre === "string" ? item.pacienteNombre.trim() : "",
    typeof item.paciente_nombre === "string" ? item.paciente_nombre.trim() : "",
    `${apellido} ${nombre}`.trim(),
  ].find(Boolean) || "Paciente";

  const pacienteId =
    typeof item.pacienteId === "number"
      ? item.pacienteId
      : typeof item.paciente_id === "number"
        ? item.paciente_id
        : paciente && typeof paciente.id === "number"
          ? paciente.id
          : null;

  const fechaHora =
    (typeof item.fechaHora === "string" && item.fechaHora) ||
    (typeof item.fecha_hora === "string" && item.fecha_hora) ||
    (typeof item.fecha === "string" && item.fecha) ||
    "";

  const estadoRaw =
    (typeof item.estado === "string" && item.estado.toUpperCase()) ||
    (typeof item.status === "string" && item.status.toUpperCase()) ||
    "PENDIENTE";

  const estado: EstadoTurno =
    estadoRaw === "CONFIRMADO" ||
    estadoRaw === "CANCELADO" ||
    estadoRaw === "AUSENTE"
      ? estadoRaw
      : "PENDIENTE";

  return {
    id:
      typeof item.id === "number"
        ? item.id
        : typeof item.id === "string"
          ? Number(item.id)
          : Date.now(),
    pacienteId,
    pacienteNombre,
    telefonoContacto:
      (typeof item.telefonoContacto === "string" && item.telefonoContacto) ||
      (typeof item.telefono_contacto === "string" && item.telefono_contacto) ||
      "",
    fechaHora,
    estado,
    notas:
      (typeof item.notas === "string" && item.notas) ||
      (typeof item.nota === "string" && item.nota) ||
      "",
  };
};

const getByCandidates = async <T>(
  endpoints: string[],
  mapper: (data: unknown) => T,
): Promise<T> => {
  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint);
      return mapper(res.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No se encontró endpoint de agenda");
};

const sendByCandidates = async <T>(
  method: "post" | "put" | "patch",
  endpoints: string[],
  payload: Record<string, unknown>,
  mapper: (data: unknown) => T,
): Promise<T> => {
  for (const endpoint of endpoints) {
    try {
      const res =
        method === "post"
          ? await api.post(endpoint, payload)
          : method === "put"
            ? await api.put(endpoint, payload)
            : await api.patch(endpoint, payload);
      return mapper(res.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No se encontró endpoint para agenda");
};

export const getAgendaByDate = async (date: string): Promise<AgendaTurno[]> =>
  getByCandidates(
    [
      `/agenda?fecha=${encodeURIComponent(date)}`,
      `/turnos?fecha=${encodeURIComponent(date)}`,
      `/turnos/dia?fecha=${encodeURIComponent(date)}`,
    ],
    (data) => (Array.isArray(data) ? data.map((item) => mapTurno(item as Record<string, unknown>)) : []),
  );

export const createTurno = async (payload: AgendaTurnoPayload): Promise<AgendaTurno> =>
  sendByCandidates(
    "post",
    ["/agenda", "/turnos", "/agenda/turnos"],
    payload as unknown as Record<string, unknown>,
    (data) => mapTurno(data as Record<string, unknown>),
  );

export const updateTurno = async (
  turnoId: number,
  payload: Partial<AgendaTurnoPayload>,
): Promise<AgendaTurno> =>
  sendByCandidates(
    "put",
    [`/agenda/${turnoId}`, `/turnos/${turnoId}`, `/agenda/turnos/${turnoId}`],
    payload,
    (data) => mapTurno(data as Record<string, unknown>),
  );
