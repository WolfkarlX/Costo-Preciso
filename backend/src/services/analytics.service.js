// Utilidad para convertir strings con símbolos a números
export function toNum(val) {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val !== "string") return Number(val) || 0;
  const cleaned = val.replace(/[^\d.\-]/g, ""); // Elimina $, %, comas, espacios
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

// Lógica para ordenar las recetas por la métrica deseada
export function sortData(rows, metric) {
  return rows.sort((a, b) => {
    if (metric === "margin") return b.profitPercentageNum - a.profitPercentageNum;
    return b.netProfitNum - a.netProfitNum; // Ordenar por ganancia neta por defecto
  });
}
