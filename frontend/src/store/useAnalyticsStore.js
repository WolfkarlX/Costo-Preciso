// src/store/useAnalyticsStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Función para crear una clave única para cada consulta
export function makeKey({ metric = "netProfit", order, limit = 5, periodDays } = {}) {
  return [
    metric ?? "netProfit",
    order ?? "",
    String(limit ?? 5),
    periodDays ? String(periodDays) : ""
  ].join("|");
}

// Función para manejar el estado de carga y error
function setLoadingAndClearError(set, key) {
  set((s) => ({
    loadingByKey: { ...s.loadingByKey, [key]: true },
    errorByKey: { ...s.errorByKey, [key]: null }
  }));
}

// Función para manejar la finalización de la carga
function setDoneLoading(set, key) {
  set((s) => ({ loadingByKey: { ...s.loadingByKey, [key]: false } }));
}

// Función para manejar el error y mostrar el mensaje
function handleError(set, key, error) {
  const msg = error?.response?.data?.message || error.message || "Error al cargar rankings";
  set((s) => ({ errorByKey: { ...s.errorByKey, [key]: msg } }));
  toast.error(msg);
}

export const useAnalyticsStore = create((set, get) => ({
  rankingsByKey: {}, // { [key]: { rows, fetchedAt } }
  loadingByKey: {},  // { [key]: boolean }
  errorByKey: {},    // { [key]: string | null }

  // Función para obtener los rankings de las recetas
  fetchRecipesRankings: async ({ metric = "netProfit", order, limit = 5, periodDays } = {}) => {
    const key = makeKey({ metric, order, limit, periodDays });

    // Evita llamadas duplicadas si ya está cargando
    if (get().loadingByKey[key]) return;

    // Marca que la petición está en proceso y limpia cualquier error previo
    setLoadingAndClearError(set, key);

    try {
      // Construcción de los parámetros para la consulta
      const params = new URLSearchParams({ metric, limit });
      if (order) params.set("order", order);
      if (periodDays) params.set("periodDays", String(periodDays));

      // Realiza la petición a la API
      const res = await axiosInstance.get(`/analytics/recipes-rankings?${params.toString()}`);
      const rows = res.data?.rows ?? [];

      // Actualiza el estado con los rankings obtenidos
      set((s) => ({
        rankingsByKey: { ...s.rankingsByKey, [key]: { rows, fetchedAt: Date.now() } }
      }));
    } catch (error) {
      // Manejo de errores
      // Si el servidor respondió con 404, tratamos como "sin datos" y no mostramos el toast.
      if (error?.response?.status === 404){
        set((s) => ({
          rankingsByKey: { ...s.rankingsByKey, [key]: { rows: [], fetchedAt: Date.now() } },
          errorByKey: { ...s.errorByKey, [key]: null }
        }));
      } else {
        handleError(set, key, error);
      }
    } finally {
      // Marca que la petición ha finalizado
      setDoneLoading(set, key);
    }
  }
}));
