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
  metric,        
  order,         
  limit = 5,
  periodDays     
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

  if (error) return <div className="text-red-500">Error: {error}</div>;
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
        data: values,
        backgroundColor: "rgba(79, 149, 157, 0.8)", // Color principal (azul verdoso)
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
          // Personalizar el contenido del tooltip
          title: (tooltipItem) => {
            // Retornar el nombre de la receta
            const label = tooltipItem[0].label;
            return label;
          },
          label: (tooltipItem) => {
            // Retornar el nombre y el valor (usando el valor de la barra)
            const value = tooltipItem.raw;
            return `${tooltipItem.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          callback: (v) => `${v}`
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {title && <h3 className="text-xl font-semibold text-primary">{title}</h3>}
      <Bar data={chartData} options={options} />
    </div>
  );
}
