import api from "./api";


export interface Cie10DTO {
  codigo: string;
  descripcion: string;
}

export interface DiagnosticoDTO {
  descripcion: string;
  cie10Codigo?: string | null;
  principal: boolean;
  evolucion?: string;
  tratamiento?: string;
}

export interface DiagnosticoResponseDTO {
  id: number;
  descripcion: string;
  evolucion?: string;
  tratamiento?: string;
  principal: boolean;
  fecha: string;
  cie10?: Cie10DTO;
  historiaClinicaId?: number;
}

export const autocompleteDiagnosticos = async (
  query: string,
): Promise<Cie10DTO[]> => {
  const res = await api.get(
    `/diagnosticos/autocomplete?q=${encodeURIComponent(query)}`,
  );
  return res.data;
};

export const createDiagnostico = async (
  payload: DiagnosticoDTO,
): Promise<DiagnosticoResponseDTO> => {
  const res = await api.post("/diagnosticos", payload);
  return res.data;
};