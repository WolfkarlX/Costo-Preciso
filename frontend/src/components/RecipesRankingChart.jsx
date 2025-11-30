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

  const colors = {
    netProfit: "rgba(0, 102, 128, 0.85)",       // azul petróleo
    expectedProfit: "rgba(40, 143, 90, 0.85)",  // verde
    totalCost: "rgba(207, 112, 40, 0.85)",      // naranja quemado
  };

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
        data: values,
        backgroundColor: colors[metric],
        borderColor: colors[metric].replace("0.85", "1"),
        borderWidth: 1
      },
    ],
  }), [labels, values, datasetLabel]);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { beginAtZero: true } }
  };

  return (
    <div className="max-w-4xl mx-auto" style={{ height: 360 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
