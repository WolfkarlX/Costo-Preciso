// src/components/RecipesRankingChart.jsx
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import "../styles/carga.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * Props:
 * - title: string
 * - metric: "netProfit" | "expectedProfit" | "totalCost"
 * - rows: [{ name, metricValue, ... }]
 * - isLoading: boolean
 * - error: string | null
 */
export default function RecipesRankingChart({ title, metric, rows, isLoading, error }) {
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (isLoading) return <div className="spinner"></div>;
  if (!rows || rows.length === 0) return <p>No hay datos para mostrar.</p>;

  const labels = rows.map((r) => r.name);
  const values = rows.map((r) => Number(r.metricValue ?? 0));

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
        data: values,
        backgroundColor: "rgba(79, 149, 157, 0.8)",
        borderColor: "rgba(79, 149, 157, 1)",
        borderWidth: 1
      }
    ]
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: {
        mode: "nearest",
        intersect: false,
        callbacks: {
          title: (items) => items?.[0]?.label ?? "",
          label: (item) => `${item.label}: ${item.raw}`
        }
      }
    },
    scales: {
      x: { ticks: { callback: (v) => `${v}` } }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {title && <h3 className="text-xl font-semibold text-primary">{title}</h3>}
      <Bar data={chartData} options={options} />
    </div>
  );
}
