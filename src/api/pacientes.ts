import api from "./api";

export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

export const getPacientes = async (): Promise<Paciente[]> => {
  const res = await api.get("/pacientes");
  return res.data;
};