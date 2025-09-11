// src/store/useAnalyticsStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export function makeKey({ metric = "netProfit", order, limit = 5, periodDays } = {}) {
  return [
    metric ?? "netProfit",
    order ?? "",
    String(limit ?? 5),
    periodDays ? String(periodDays) : ""
  ].join("|");
}
export const useAnalyticsStore = create((set, get) => ({
  rankingsByKey: {}, // { [key]: { rows, fetchedAt } }
  loadingByKey: {},  // { [key]: boolean }
  errorByKey: {},    // { [key]: string | null }

  fetchRecipesRankings: async ({ metric = "netProfit", order, limit = 5, periodDays } = {}) => {
    const key = makeKey({ metric, order, limit, periodDays });

    // Evita llamadas duplicadas si ya está cargando
    /* Antes de pedir datos, revisa si ya está cargando esa misma key.
      Si sí → sale de la función para no duplicar peticiones innecesarias.
    */
    if (get().loadingByKey[key]) return;

    /*
    Marca que esa petición está cargando (loadingByKey[key] = true).
    Limpia cualquier error previo para esa key.
    */
    set((s) => ({
      loadingByKey: { ...s.loadingByKey, [key]: true },
      errorByKey: { ...s.errorByKey, [key]: null }
    }));

    try {
      const params = new URLSearchParams({ metric, limit }); // Investigar la seguridad.
      if (order) params.set("order", order);
      if (periodDays) params.set("periodDays", String(periodDays));

      const res = await axiosInstance.get(`/analytics/recipes-rankings?${params.toString()}`);
      const rows = res.data?.rows ?? [];

      set((s) => ({
        rankingsByKey: { ...s.rankingsByKey, [key]: { rows, fetchedAt: Date.now() } }
      }));
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Error al cargar rankings";
      set((s) => ({ errorByKey: { ...s.errorByKey, [key]: msg } }));
      toast.error(msg);
    } finally {
      set((s) => ({ loadingByKey: { ...s.loadingByKey, [key]: false } }));
    }
  }
}));