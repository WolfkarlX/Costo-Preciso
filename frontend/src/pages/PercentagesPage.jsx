// pages/PercentagesPage.jsx (o AnalyticsPage.jsx)
import RecipesRankingChart from "../components/RecipesRankingChart.jsx";

export default function AnalyticsPage() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 32 }}>
      <h1>Analítica de Recetas</h1>

      <section>
        <RecipesRankingChart
          title="Recetas con mayor ganancia neta"
          metric="netProfit"
          order="desc"   // top mayores
          limit={5}
          // periodDays={30}
        />
      </section>

      <section>
        <RecipesRankingChart
          title="Recetas con mayor ganancia esperada"
          metric="expectedProfit"
          order="desc"
          limit={5}
          // periodDays={30}
        />
      </section>

      <section>
        <RecipesRankingChart
          title="Recetas más costosas de hacer"
          metric="totalCost"
          order="desc"   // más costosas = costo más alto primero
          limit={5}
        />
      </section>

      <section>
        <RecipesRankingChart
          title="Recetas más baratas de hacer"
          metric="totalCost"
          order="asc"    // más baratas = costo menor primero
          limit={5}
        />
      </section>
    </main>
  );
}
