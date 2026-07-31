import axiosInstance from "./axiosInstance";

export interface CantidadPorCategoria {
  codigo: string;
  descripcion: string;
  cantidad: number;
}

export interface EstadisticasResumen {
  desde: string;
  hasta: string;
  pacientesActivos: number;
  turnosDelMes: number;
  ausentesDelMes: number;
  porcentajeAusentismo: number;
  turnosMesPorEstado: CantidadPorCategoria[];
  diagnosticosPrincipalesFrecuentes: CantidadPorCategoria[];
  evaluacionesBeckPorPaciente: CantidadPorCategoria[];
}

export const getEstadisticasResumen = async (
  anio?: number,
  mes?: number,
): Promise<EstadisticasResumen> => {
  const response = await axiosInstance.get<EstadisticasResumen>(
    "/estadisticas/resumen",
    {
      params: {
        anio,
        mes,
      },
    },
  );

  return response.data;
};
