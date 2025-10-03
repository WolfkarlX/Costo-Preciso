// controllers/analytics.controller.js
import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";
import { sortData, toNum, makeKey } from "../services/analytics.service.js"; // utilidades ligeras

/**
 * Utils de validación
 */
const METRICS = new Set(["netProfit", "expectedProfit", "totalCost"]);
const ORDERS = new Set(["asc", "desc"]);

function parsePositiveInt(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number.parseInt(value, 10);
  if (Number.isFinite(n) && n >= min && n <= max) return n;
  return fallback;
}

function badRequest(res, message) {
  return res.status(400).json({ message });
}

function unauthorized(res, message = "No autorizado") {
  return res.status(401).json({ message });
}

/**
 * Controller para rankings
 */
export async function recipesRankings(req, res) {
  if (!req?.user?._id) {
    return unauthorized(res);
  }

  try {
    // 1) Validar params
    const rawMetric = (req.query.metric || "netProfit").trim();
    if (!METRICS.has(rawMetric)) {
      return badRequest(res, "Parámetro 'metric' inválido. Usa: netProfit | expectedProfit | totalCost");
    }
    const metric = rawMetric;

    const rawOrder = (req.query.order || "").trim();
    const order = ORDERS.has(rawOrder) ? rawOrder : undefined;

    const limit = parsePositiveInt(req.query.limit, 5, { min: 1, max: 50 });

    let periodDays;
    if (req.query.periodDays !== undefined) {
      const pd = parsePositiveInt(req.query.periodDays, NaN, { min: 1, max: 3650 });
      if (!Number.isFinite(pd)) {
        return badRequest(res, "Parámetro 'periodDays' debe ser un entero positivo.");
      }
      periodDays = pd;
    }

    // 2) Validar userId
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(req.user._id);
    } catch {
      return unauthorized(res);
    }

    // 3) Armar match
    const match = { userId: userObjectId };
    if (periodDays) {
      const from = new Date();
      from.setDate(from.getDate() - periodDays);
      match.createdAt = { $gte: from };
    }

    // 4) Ordenamiento
    const defaultOrderDir = -1;
    const sortDir = order === "asc" ? 1 : order === "desc" ? -1 : defaultOrderDir;
    const effectiveOrder = sortDir === 1 ? "asc" : "desc";

    // 5) Pipeline
    const pipeline = [
      { $match: match },
      {
        $addFields: {
          totalCostNum: { $toDouble: "$totalCost" },
          netProfitNum: { $toDouble: "$netProfit" },
          unitSalePriceNum: { $toDouble: "$unitSalePrice" },
          portionsNum: { $toDouble: "$portionsPerrecipe" },
          costPerunityNum: { $toDouble: "$costPerunity" }
        }
      },
      {
        $addFields: {
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
              : "$netProfit"
        }
      },
      { $sort: { metricValue: sortDir, createdAt: -1 } },
      { $limit: Number(limit) }
    ];

    // 6) Ejecutar
    const rows = await Recipe.aggregate(pipeline).exec();

    return res.status(200).json({
      metric,
      order: effectiveOrder,
      rows,
    });

  } catch (err) {
    console.error("[recipesRankings] Error inesperado:", err.message || err);
    return res.status(500).json({ message: "Ocurrió un error inesperado." });
  }
}
