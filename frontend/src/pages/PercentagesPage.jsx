import RecipesRankingChart from "../components/RecipesRankingChart.jsx";

export default function AnalyticsPage() {
  return (
    <main className="p-6 space-y-8 bg-primary-light">
      <h1 className="text-4xl font-semibold text-primary">Analítica de Recetas</h1>

      <section className="p-4 bg-white rounded-lg shadow-lg">
        <RecipesRankingChart
          title="Recetas con mayor ganancia neta"
          metric="netProfit"
          order="desc"
          limit={5}
        />
      </section>

      <section className="p-4 bg-white rounded-lg shadow-lg">
        <RecipesRankingChart
          title="Recetas con mayor ganancia esperada"
          metric="expectedProfit"
          order="desc"
          limit={5}
        />
      </section>

      <section className="p-4 bg-white rounded-lg shadow-lg">
        <RecipesRankingChart
          title="Recetas más costosas de hacer"
          metric="totalCost"
          order="desc"
          limit={5}
        />
      </section>

      <section className="p-4 bg-white rounded-lg shadow-lg">
        <RecipesRankingChart
          title="Recetas más baratas de hacer"
          metric="totalCost"
          order="asc"
          limit={5}
        />
      </section>
    </main>
  );
}
