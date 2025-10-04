// src/pages/AnalyticsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useAnalyticsStore, makeKey } from "../store/useAnalyticsStore";
import RecipesRankingChart from "../components/RecipesRankingChart";

/**
 * Hook local: calcula la key y selecciona {rows,isLoading,error} del store.
 */
function useRecipesRankings(params) {
  const key = useMemo(() => makeKey(params), [params]);
  const rows = useAnalyticsStore((s) => s.rankingsByKey[key]?.rows);
  const isLoading = useAnalyticsStore((s) => !!s.loadingByKey[key]);
  const error = useAnalyticsStore((s) => s.errorByKey[key] ?? null);
  return { rows, isLoading, error };
}

export default function AnalyticsPage() {
  // Filtros globales
  const [periodDays, setPeriodDays] = useState(""); // "", "7", "30", etc.
  const [limit, setLimit] = useState(5);           // valor numérico real usado por la app
  const [limitInput, setLimitInput] = useState("5"); // lo que se ve en el input (string)

  // Mantiene sync el input cuando cambie 'limit' por codigo.
  useEffect(() => {
    setLimitInput(String(limit));
  }, [limit]);

  // Config base por ranking
  const cfgTopNet = { metric: "netProfit", order: "desc" };
  const cfgTopExpected = { metric: "expectedProfit", order: "desc" };
  const cfgMostExpensive = { metric: "totalCost", order: "desc" };
  const cfgCheapest = { metric: "totalCost", order: "asc" };

  const withGlobals = (cfg) => ({
    ...cfg,
    limit,
    periodDays: periodDays ? Number(periodDays) : undefined
  });

  // Memo de params por sección (evita objetos nuevos en cada render)
  const paramsTopNet = useMemo(() => withGlobals(cfgTopNet), [limit, periodDays]);
  const paramsTopExpected = useMemo(() => withGlobals(cfgTopExpected), [limit, periodDays]);
  const paramsMostExpensive = useMemo(() => withGlobals(cfgMostExpensive), [limit, periodDays]);
  const paramsCheapest = useMemo(() => withGlobals(cfgCheapest), [limit, periodDays]);

  // Disparar fetch para TODAS las secciones con un solo efecto
  const fetchRank = useAnalyticsStore((s) => s.fetchRecipesRankings);
  useEffect(() => {
    if (limit === 0) return;
    fetchRank(paramsTopNet);
    fetchRank(paramsTopExpected);
    fetchRank(paramsMostExpensive);
    fetchRank(paramsCheapest);
  }, [fetchRank, paramsTopNet, paramsTopExpected, paramsMostExpensive, paramsCheapest, limit]);

  // Leer estado de cada sección (hooks directos, sin loops)
  const topNet = useRecipesRankings(paramsTopNet);
  const topExpected = useRecipesRankings(paramsTopExpected);
  const mostExpensive = useRecipesRankings(paramsMostExpensive);
  const cheapest = useRecipesRankings(paramsCheapest);

  // Helper presentacional para no repetir el ternario de estado
  // Bloque de codigoq ue controla el color y el contenido del texto dentro de cada sección.
  const renderSection = (title, metric, state) => {
    const { rows, isLoading, error } = state;
    return (
      <section className="p-4 bg-white rounded-lg shadow-lg space-y-2">
        <h3 className="text-xl font-semibold text-primary text-center">{title}</h3>
        
        {limit === 0 ? (
          <p className="text-gray-700 font-medium text-center">Debes establecer un limite para mostrar las gráficas.</p>
        ) : error ? (
          <div className="text-red-600 font-medium text-center">Error: {error}</div>
        ) : isLoading ? (
          <div className="spinner" aria-busy="true" aria-live="polite" />
        ) : !rows || rows.length === 0 ? (
          <p className="text-gray-700 font-medium text-center">No hay recetas activas para mostrar en esta categoría.</p>
        ) : (
          <RecipesRankingChart title={title} metric={metric} rows={rows} />
        )}
      </section>
    );
  };

  // ✅ Un SOLO return en todo el archivo
  return (
    <main className="p-6 space-y-8 bg-primary-light font-title">
      <h1 className="text-4xl font-semibold text-primary">Analítica de Recetas</h1>

      {/* Controles globales */}
      <div className="p-4 bg-white rounded-lg shadow-lg grid gap-4 sm:grid-cols-3">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium mb-2">Periodo (días)</span>
          </label>
          <input
            type="number"
            min="1"
            placeholder="Ej. 7, 30…"
            className="input w-full shadow-md border-none"
            value={periodDays}
            onChange={(e) => setPeriodDays(e.target.value)}
          />
          <small className="text-gray-700 font-medium text-center">
            Filtra recetas creadas en los últimos N días.
          </small>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium mb-2">Límite por ranking</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="0"
            step="1"
            placeholder="Ejemplo: 0, 3, 10, 15..."
            className="input w-full shadow-md border-none"
            value={limitInput}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const v = e.target.value;
              // permite vacío o solo dígitos (incluye 0)
              if (v === "" || /^\d+$/.test(v)) {
                setLimitInput(v);
              }
            }}
            onBlur={() => {
              // normaliza al salir del input
              const n = parseInt(limitInput, 10);
              const normalized = Number.isFinite(n) && n >= 0 ? n : 0;
              setLimit(normalized);
              setLimitInput(String(normalized));
            }}
            aria-label="Cantidad de recetas a mostrar por ranking"
          />
          <small className="text-gray-700 font-medium text-center">
            Número de recetas a mostrar por ranking. Si pones 0, no se mostrarán gráficas.
          </small>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium mb-2">Acciones</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary font-bold"
              onClick={() => { /* Los cambios ya se aplican automáticamente */ }}
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => { setPeriodDays(""); 
                setLimit(5); 
                setLimitInput("5");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Secciones */}
      {renderSection("Recetas con mayor ganancia neta", "netProfit", topNet)}
      {renderSection("Recetas con mayor ganancia esperada", "expectedProfit", topExpected)}
      {renderSection("Recetas más costosas de hacer", "totalCost", mostExpensive)}
      {renderSection("Recetas más baratas de hacer", "totalCost", cheapest)}
    </main>
  );
}
