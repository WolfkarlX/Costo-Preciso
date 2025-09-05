// src/store/useAnalyticsStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const makeKey = ({ metric = "netProfit", order, limit = 5, periodDays }) =>
  [
    metric ?? "netProfit",
    order ?? "",
    String(limit ?? 5),
    periodDays ? String(periodDays) : ""
  ].join("|");

export const useAnalyticsStore = create((set, get) => ({
  rankingsByKey: {}, // { [key]: { rows, fetchedAt } }
  loadingByKey: {},  // { [key]: boolean }
  errorByKey: {},    // { [key]: string | null }

  fetchRecipesRankings: async ({ metric = "netProfit", order, limit = 5, periodDays } = {}) => {
    const key = makeKey({ metric, order, limit, periodDays });

    // Evita llamadas duplicadas si ya está cargando
    if (get().loadingByKey[key]) return;

    // (Opcional) TTL para reusar datos recientes (descomenta si quieres cache por 60s)
    // const cached = get().rankingsByKey[key];
    // const TTL = 60 * 1000;
    // if (cached && Date.now() - cached.fetchedAt < TTL) return;

    set((s) => ({
      loadingByKey: { ...s.loadingByKey, [key]: true },
      errorByKey: { ...s.errorByKey, [key]: null }
    }));

    try {
      const params = new URLSearchParams({ metric, limit });
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

/**
 * Hook suscrito por clave de parámetros: garantiza re-render tras el fetch
 */
export const useRecipesRankings = (params) => {
  const key = makeKey(params);
  const rows = useAnalyticsStore((s) => s.rankingsByKey[key]?.rows);
  const isLoading = useAnalyticsStore((s) => !!s.loadingByKey[key]);
  const error = useAnalyticsStore((s) => s.errorByKey[key] ?? null);
  return { rows, isLoading, error };
};
