import { axiosInstance } from "../lib/axios.js"; // Ajusta la ruta según corresponda
import IngredientCostChart from "../components/TopRecipesChart.jsx";  // Componente para mostrar el gráfico de torta

export default function AnalyticsPage() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 24 }}>
      <h1>Analítica de Recetas</h1>

      {/* Sección para el gráfico de ganancia neta de las recetas */}
      <section>
        <h2>Top Recetas por Ganancia Neta</h2>
        <p>
          Este gráfico muestra las recetas con la mayor ganancia neta, para ayudar a entender qué recetas están generando más ingresos después de los costos.
        </p>
        <IngredientCostChart
          metric="profit"
          limit={5}
          // periodDays={30} // si quieres filtrar últimos 30 días
        />
      </section>

      {/* Sección para el gráfico de margen de las recetas */}
      <section>
        <h2>Top Recetas por Margen (%)</h2>
        <p>
          Este gráfico muestra el porcentaje de margen de ganancia de las recetas. Es útil para ver qué recetas tienen un mayor margen en relación con su costo.
        </p>
        <IngredientCostChart
          metric="margin"
          limit={5}
        />
      </section>

      {/* Sección para el gráfico de costos por ingrediente */}
      <section>
        <h2>Distribución del Costo por Ingrediente</h2>
        <p>
          Este gráfico muestra cómo se distribuye el costo de cada receta entre sus ingredientes. Puedes ver qué ingredientes tienen mayor impacto en el costo total de la receta.
        </p>
        <IngredientCostChart
          limit={5}
          // periodDays={30} // si quieres filtrar los últimos 30 días
        />
      </section>
    </main>
  );
}
