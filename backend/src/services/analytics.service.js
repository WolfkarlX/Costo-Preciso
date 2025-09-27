// services/analytics.service.js
import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";

/**
 * Utilidad para convertir strings con símbolos a números
 * (la dejamos disponible si la usas en otros lugares)
 */
export function toNum(val) {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val !== "string") return Number(val) || 0;
  const cleaned = val.replace(/[^\d.\-]/g, ""); // Elimina $, %, comas, espacios
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Lógica para ordenar arreglos en memoria (si en algún flow hicieras sort local).
 * Para rankings usamos $sort en el agregado, pero conservamos esta util por compatibilidad.
 */
export function sortData(rows, metric) {
  return rows.sort((a, b) => {
    if (metric === "margin") return b.profitPercentageNum - a.profitPercentageNum;
    return b.netProfitNum - a.netProfitNum; // Ordenar por ganancia neta por defecto
  });
}

export const makeKey = ({ metric = "netProfit", order, limit = 5, periodDays } = {}) =>
  [
    metric ?? "netProfit",
    order ?? "",
    String(limit ?? 5),
    periodDays ? String(periodDays) : ""
  ].join("|");

/**
 * Servicio principal para rankings.
 * Encapsula TODA la lógica pesada que antes estaba en el controller:
 * - Validación de userId como ObjectId
 * - Construcción de match (con periodo)
 * - Agregación con conversiones numéricas y expectedProfit
 * - Ordenamiento y límite
 * - Manejo de errores del pipeline
 *
 * Devuelve:
 *  { rows: [...], effectiveOrder: "asc" | "desc" }
 */
export async function recipesRankingsService({ userId, metric, order, limit, periodDays }) {
  // 1) Validar userId como ObjectId (no exponer detalles)
  let userObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch {
    const e = new Error("No autorizado");
    e.status = 401;
    throw e;
  }

  // 2) match por usuario y periodo
  const match = { userId: userObjectId };
  if (periodDays) {
    const from = new Date();
    from.setDate(from.getDate() - Number(periodDays));
    match.createdAt = { $gte: from };
  }

  // 3) Dirección de ordenamiento (default desc para todas las métricas)
  const defaultOrderDir = -1;
  const sortDir = order === "asc" ? 1 : order === "desc" ? -1 : defaultOrderDir;
  const effectiveOrder = sortDir === 1 ? "asc" : "desc";

  // 4) Pipeline pesado (conversión numérica + expectedProfit + sort + limit)
  const pipeline = [
    { $match: match },
    {
      $addFields: {
        totalCostNum: { $toDouble: "$totalCost" },
        netProfitNum: { $toDouble: "$netProfit" },
        unitSalePriceNum: { $toDouble: "$unitSalePrice" },
        portionsNum: { $toDouble: "$portionsPerrecipe" }, // mantener nombre exacto del campo
        costPerunityNum: { $toDouble: "$costPerunity" }
      }
    },
    {
      $addFields: {
        // expectedProfit = (precio_venta_unitario * porciones) - costo_total
        expectedProfitNum: {
          $subtract: [
            { $multiply: ["$unitSalePriceNum", "$portionsNum"] },
            "$totalCostNum"
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        name: 1,
        totalCost: { $ifNull: ["$totalCostNum", 0] },
        netProfit: { $ifNull: ["$netProfitNum", 0] },
        expectedProfit: { $ifNull: ["$expectedProfitNum", 0] },
        createdAt: 1
      }
    },
    {
      $addFields: {
        metricValue:
          metric === "totalCost"
            ? "$totalCost"
            : metric === "expectedProfit"
            ? "$expectedProfit"
            : "$netProfit" // default netProfit
      }
    },
    { $sort: { metricValue: sortDir, createdAt: -1 } },
    { $limit: Number(limit) }
  ];

  // 5) Ejecutar la agregación
  try {
    const rows = await Recipe.aggregate(pipeline).exec();
    return { rows, effectiveOrder };
  } catch (aggErr) {
    // Log detallado solo del lado servidor
    console.error("[recipesRankingsService] Error en aggregate:", {
      err: aggErr?.message || aggErr,
      userId: String(userId),
      metric,
      order: order ?? "(default)",
      limit,
      periodDays: periodDays ?? "(none)"
    });
    const e = new Error("No fue posible obtener la analítica en este momento.");
    e.status = 500;
    throw e;
  }
}
