// src/components/RecipesRankingChart.jsx
import { Bar } from "react-chartjs-2";
import { useMemo } from "react";
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
 */

// No manejar errores en el componente. Utilizar unicamente Store para manejar errores. y Pages para mostrar "errores" fuera del backend.
export default function RecipesRankingChart({ title, metric, rows = [] }) {
  if (rows.length === 0) return null;

  const labels = useMemo(() => rows.map(r => r.name), [rows]);
  const values = useMemo(() => rows.map(r => Number(r.metricValue ?? 0)), [rows]);

  const datasetLabel =
    metric === "totalCost"
      ? "Costo total"
      : metric === "expectedProfit"
      ? "Ganancia esperada"
      : "Ganancia neta";

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: datasetLabel,
        data : values,
        backgroundColor: "rgba(79, 149, 157, 0.8)",
        borderColor : "rgba(79, 149, 157, 1)",
        borderWidth : 1
      },
    ],
  }), [labels, values, datasetLabel]);

  const options = useMemo(() => ({
    indexAxis: "y",
    responsive : true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true},
      tooltip: {
        mode: "nearest",
        intersect: false,
        callbacks: {
          title: (items) => items?.[0]?.label ?? "",
          label: (item) => `${item.dataset.label}: ${item.raw}`
        }
      }
    },
    scales: {
      x: { beginAtZero: true }
    }
  }), []);

  return (
    <div className="max-w-4xl mx-auto" style={{ height: 360 }}>
      {title && <h3 className="text-xl font-semibold text-primary">{title}</h3>}
      <Bar data={chartData} options={options} />
    </div>
  );
}
