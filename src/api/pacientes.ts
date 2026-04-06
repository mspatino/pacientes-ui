import api from "./api";

export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  sexo?: "Masculino" | "Femenino" | "Otro" | string;
  diagnostico?: string;
  fechaAlta?: string;
  fecha_alta?: string;
}

export type PacienteResponseDTO = Paciente & Record<string, unknown>;

export const getPacientes = async (): Promise<Paciente[]> => {
  const res = await api.get("/pacientes");
  return res.data;
};

export const getPacienteById = async (id: number): Promise<PacienteResponseDTO> => {
  const res = await api.get(`/pacientes/${id}`);
  return res.data;
};
