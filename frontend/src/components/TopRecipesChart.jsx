import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "../styles/carga.css";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { axiosInstance } from "../lib/axios.js"; // Ajusta la ruta según corresponda

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function TopRecipesChart({
  metric = "profit", // "profit" o "margin"
  limit = 5,
  periodDays // opcional (por ej. 30)
}) {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ metric, limit });
    if (periodDays) params.set("periodDays", periodDays);

    // Usar axiosInstance para la solicitud
    axiosInstance
      .get(`/analytics/top-recipes?${params.toString()}`)
      .then((response) => {
        const data = response.data;
        setChartData({
          labels: data.labels,
          datasets: [{
            label: data?.datasets?.[0]?.label ?? (metric === "margin" ? "Margen (%)" : "Ganancia neta"),
            data: data?.datasets?.[0]?.data ?? [],
          }]
        });
      })
      .catch((e) => setError(e.message));
  }, [metric, limit, periodDays]);

  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;
  if (!chartData) 
  return <div className="spinner"></div>;

  const options = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
