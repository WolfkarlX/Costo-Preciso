// controllers/analytics.controller.js
import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";

/**
 * Utilidades de validación y respuesta
 */
const METRICS = new Set(["netProfit", "expectedProfit", "totalCost"]);
const ORDERS = new Set(["asc", "desc"]);

function parsePositiveInt(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number.parseInt(value, 10);
  if (Number.isFinite(n) && n >= min && n <= max) return n;
  return fallback;
}

function badRequest(res, message, details) {
  // details solo se loggea, no se envía
  return res.status(400).json({ message });
}

function unauthorized(res, message = "No autorizado") {
  return res.status(401).json({ message });
}

export async function recipesRankings(req, res) {
  // 1) Autenticación básica
  if (!req?.user?._id) {
    // No exponer detalles al cliente
    return unauthorized(res);
  }

  try {
    // 2) Leer y validar query params
    const rawMetric = (req.query.metric || "netProfit").trim();
    const rawOrder = (req.query.order || "").trim();
    const rawLimit = req.query.limit;
    const rawPeriodDays = req.query.periodDays;

    // metric
    if (!METRICS.has(rawMetric)) {
      return badRequest(res, "Parámetro 'metric' inválido. Usa: netProfit | expectedProfit | totalCost");
    }
    const metric = rawMetric;

    // order (opcional)
    const order = ORDERS.has(rawOrder) ? rawOrder : undefined;

    // limit (default 5; clamp 1..50)
    const limit = parsePositiveInt(rawLimit, 5, { min: 1, max: 50 });

    // periodDays (opcional, entero >= 1)
    let periodDays;
    if (rawPeriodDays !== undefined) {
      const pd = parsePositiveInt(rawPeriodDays, NaN, { min: 1, max: 3650 });
      if (!Number.isFinite(pd)) {
        return badRequest(res, "Parámetro 'periodDays' debe ser un entero positivo.");
      }
      periodDays = pd;
    }

    // 3) Construir match por usuario y periodo
    const userId = req.user._id;
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (_) {
      // Si el _id no es válido, no exponemos el dato al cliente
      return unauthorized(res);
    }

    const match = { userId: userObjectId };
    if (periodDays) {
      const from = new Date();
      from.setDate(from.getDate() - Number(periodDays));
      match.createdAt = { $gte: from };
    }

    // 4) Dirección de ordenamiento
    // Por defecto “top” descendente para todas las métricas
    const defaultOrderDir = -1;
    const sortDir = order === "asc" ? 1 : order === "desc" ? -1 : defaultOrderDir;

    // 5) Pipeline de agregación
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
              : "$netProfit"
        }
      },
      { $sort: { metricValue: sortDir, createdAt: -1 } },
      { $limit: Number(limit) }
    ];

    // 6) Ejecutar consulta
    let rows;
    try {
      rows = await Recipe.aggregate(pipeline).exec();
    } catch (aggErr) {
      // Log detallado solo en servidor
      console.error("[recipesRankings] Error en aggregate:", {
        err: aggErr?.message || aggErr,
        userId: String(userId),
        metric,
        order: order ?? "(default)",
        limit,
        periodDays: periodDays ?? "(none)"
      });
      return res.status(500).json({ message: "No fue posible obtener la analítica en este momento." });
    }

    // 7) Respuesta exitosa (no exponemos detalles internos)
    return res.status(200).json({
      metric,
      order: sortDir === 1 ? "asc" : "desc",
      rows // [{ name, totalCost, netProfit, expectedProfit, metricValue }]
    });
  } catch (err) {
    // Cualquier error inesperado
    console.error("[recipesRankings] Error inesperado:", {
      err: err?.message || err,
      stack: err?.stack
    });
    return res.status(500).json({ message: "Ocurrió un error inesperado." });
  }
}
