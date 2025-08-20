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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function TopRecipesChart({
  apiBase = "http://localhost:5001", // cambia si lo necesitas
  metric = "profit",                 // "profit" o "margin"
  limit = 5,
  periodDays                        // opcional (por ej. 30)
}) {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ metric, limit });
    if (periodDays) params.set("periodDays", periodDays);

    fetch(`${apiBase}/api/analytics/top-recipes?${params.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // Opción A: usamos tal cual lo que manda tu endpoint
        setChartData({
          labels: data.labels,
          datasets: [{
            label: data?.datasets?.[0]?.label ?? (metric === "margin" ? "Margen (%)" : "Ganancia neta"),
            data: data?.datasets?.[0]?.data ?? [],
          }]
        });
      })
      .catch((e) => setError(e.message));
  }, [apiBase, metric, limit, periodDays]);

  if (error) return <div style={{color:"crimson"}}>Error: {error}</div>;
  if (!chartData) return <div>Cargando…</div>;

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
