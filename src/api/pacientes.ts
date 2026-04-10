import api from "./api";
import axios from "axios";

export type EstadoCivilTipo = string;
export type ConvivienteTipo = string;

export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  direccion?: string;
  telefono?: string;
  ocupacion?: string;
  estadoCivil?: EstadoCivilTipo;
  sexo?: "Masculino" | "Femenino" | "Otro" | string;
  email?: string;
  convivientes?: ConvivienteTipo[];
  fechaNacimiento?: string;
  fechaAlta?: string;
  fecha_alta?: string;
  historiaClinicaId?: number;
  diagnostico?: string;
}

export type PacienteResponseDTO = Paciente & Record<string, unknown>;

export interface HistoriaClinicaDTO {
  id?: number;
  pacienteId?: number;
  fechaAlta?: string;
  motivoConsulta?: string;
  observaciones?: string;
  medicacion?: string;
  consumo?: string;
  tratamientosAnteriores?: string;
  activa?: boolean;
  diagnosticos?: Array<Record<string, unknown>>;
}

export const getPacientes = async (): Promise<Paciente[]> => {
  const res = await api.get("/pacientes");
  return res.data;
};

export const getPacienteById = async (id: number): Promise<PacienteResponseDTO> => {
  const res = await api.get(`/pacientes/${id}`);
  return res.data;
};

export const getHistoriaClinicaByPacienteId = async (
  pacienteId: number,
): Promise<HistoriaClinicaDTO> => {
  const candidates = [
    `/historias/${pacienteId}`,
    `/pacientes/${pacienteId}/historia-clinica`,
    `/historias-clinicas/paciente/${pacienteId}`,
    `/historia-clinica/paciente/${pacienteId}`,
  ];

  for (const endpoint of candidates) {
    try {
      const res = await api.get(endpoint);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No se encontró endpoint de historia clínica para paciente");
};

export const updatePaciente = async (
  id: number,
  payload: Record<string, unknown>,
): Promise<PacienteResponseDTO> => {
  const res = await api.put(`/pacientes/${id}`, payload);
  return res.data;
};

export const deletePaciente = async (id: number): Promise<void> => {
  await api.delete(`/pacientes/${id}`);
};

export const createPaciente = async (
  payload: Record<string, unknown>,
): Promise<PacienteResponseDTO> => {
  const res = await api.post("/pacientes", payload);
  return res.data;
};
