// src/pages/AnalyticsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useAnalyticsStore, useRecipesRankings } from "../store/useAnalyticsStore";
import RecipesRankingChart from "../components/RecipesRankingChart";

const SectionRanking = ({ title, metric, order, limit, periodDays }) => {
  const fetchRank = useAnalyticsStore((s) => s.fetchRecipesRankings);
  const params = useMemo(() => ({ metric, order, limit, periodDays }), [metric, order, limit, periodDays]);

  useEffect(() => {
    fetchRank(params);
  }, [fetchRank, params]);

  const { rows, isLoading, error } = useRecipesRankings(params);

  return (
    <section className="p-4 bg-white rounded-lg shadow-lg">
      <RecipesRankingChart
        title={title}
        metric={metric}
        rows={rows}
        isLoading={isLoading}
        error={error}
      />
    </section>
  );
};

export default function AnalyticsPage() {
  // Filtros globales (aplicados a todas las secciones)
  const [periodDays, setPeriodDays] = useState(""); // "", "7", "30", etc.
  const [limit, setLimit] = useState(5);

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
          <small className="text-base-content/60 mt-1">
            Filtra recetas creadas en los últimos N días.
          </small>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium mb-2">Límite por ranking</span>
          </label>
          <select
            className="select w-full shadow-md border-none"
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
            aria-label="Cantidad de recetas a mostrar por ranking"
          >
            <option value="5">5 (recomendado)</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
          <small className="text-base-content/60 mt-1">
            Número de recetas que se mostrarán en cada gráfica.
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
              onClick={() => { setPeriodDays(""); setLimit(5); }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Secciones */}
      <SectionRanking
        title="Recetas con mayor ganancia neta"
        {...withGlobals(cfgTopNet)}
      />

      <SectionRanking
        title="Recetas con mayor ganancia esperada"
        {...withGlobals(cfgTopExpected)}
      />

      <SectionRanking
        title="Recetas más costosas de hacer"
        {...withGlobals(cfgMostExpensive)}
      />

      <SectionRanking
        title="Recetas más baratas de hacer"
        {...withGlobals(cfgCheapest)}
      />
    </main>
  );
}
