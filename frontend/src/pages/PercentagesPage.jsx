import TopRecipesChart from "../components/TopRecipesChart";

export default function AnalyticsPage() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 24 }}>
      <h1>Analítica de Recetas</h1>

      {/* Top por ganancia neta (tal cual tu endpoint) */}
      <section>
        <h2>Top Recetas por Ganancia</h2>
        <TopRecipesChart
          apiBase="http://localhost:5001"
          metric="profit"
          limit={5}
          // periodDays={30} // si quieres filtrar últimos 30 días
        />
      </section>

      {/* Si quieres también margen sin tocar backend */}
      <section>
        <h2>Top Recetas por Margen (%)</h2>
        <TopRecipesChart
          apiBase="http://localhost:5001"
          metric="margin"
          limit={5}
        />
      </section>
    </main>
  );
}
