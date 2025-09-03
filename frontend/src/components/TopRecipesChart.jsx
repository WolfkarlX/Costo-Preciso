import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";  // Usamos Pie para gráfico de torta
import "../styles/carga.css";
import {
  Chart as ChartJS,
  ArcElement,  // Necesario para gráficos de torta
  Tooltip,
  Legend
} from "chart.js";
import { axiosInstance } from "../lib/axios.js"; // Ajusta la ruta según corresponda

ChartJS.register(ArcElement, Tooltip, Legend);  // Registramos los elementos necesarios para gráficos de torta

export default function IngredientCostChart({
  limit = 5,
  periodDays // opcional (por ej. 30)
}) {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ limit });
    if (periodDays) params.set("periodDays", periodDays);

    // Usar axiosInstance para la solicitud
    axiosInstance
      .get(`/analytics/top-recipes?${params.toString()}`)
      .then((response) => {
        const data = response.data.dataForPieChart[0].ingredientsCost;  // Accede a los datos de ingredientes

        const labels = data.map(item => item.ingredient);  // Nombres de los ingredientes
        const dataValues = data.map(item => item.percentage);  // Porcentaje de costo de cada ingrediente

        setChartData({
          labels: labels,
          datasets: [{
            label: "Costo por Ingrediente (%)",
            data: dataValues,  // Asignamos los valores de porcentaje
            backgroundColor: ["#FF5733", "#FFBD33", "#FF63D3", "#33FF57", "#33D8FF"],  // Colores para cada segmento
          }],
        });
      })
      .catch((e) => setError(e.message));
  }, [limit, periodDays]);

  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;
  if (!chartData) 
    return <div className="spinner"></div>;

  return (
    <div style={{ maxWidth: 800 }}>
      <Pie data={chartData} /> {/* Usamos Pie para el gráfico de torta */}
    </div>
  );
}
