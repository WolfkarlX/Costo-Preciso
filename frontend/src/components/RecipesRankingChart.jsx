// components/RecipesRankingChart.jsx
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { axiosInstance } from "../lib/axios.js";
import "../styles/carga.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function RecipesRankingChart({
  title,
  metric,        // "netProfit" | "expectedProfit" | "totalCost"
  order,         // "asc" | "desc" (opcional; por defecto definido en backend)
  limit = 5,
  periodDays     // opcional
}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ metric, limit });
    if (order) params.set("order", order);
    if (periodDays) params.set("periodDays", periodDays);

    axiosInstance
      .get(`/analytics/recipes-rankings?${params.toString()}`)
      .then((res) => setData(res.data?.rows ?? []))
      .catch((e) => setError(e.message));
  }, [metric, limit, order, periodDays]);

  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;
  if (!data) return <div className="spinner"></div>;
  if (data.length === 0) return <p>No hay datos para mostrar.</p>;

  // Labels y valores
  const labels = data.map((r) => r.name);
  const values = data.map((r) => Number(r.metricValue ?? 0));

  const chartData = {
    labels,
    datasets: [
      {
        label:
          metric === "totalCost"
            ? "Costo total"
            : metric === "expectedProfit"
            ? "Ganancia esperada"
            : "Ganancia neta",
        data: values
      }
    ]
  };

  const options = {
    indexAxis: "y", // barras horizontales
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { mode: "nearest", intersect: false }
    },
    scales: {
      x: {
        ticks: {
          // formateo simple
          callback: (v) => `${v}`
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {title && <h3 style={{ marginBottom: 8 }}>{title}</h3>}
      <Bar data={chartData} options={options} />
    </div>
  );
}
