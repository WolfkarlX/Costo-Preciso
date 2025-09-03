// controllers/analytics.controller.js
import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";

export async function recipesRankings(req, res, next) {
  try {
    const {
      metric = "netProfit",   // netProfit | expectedProfit | totalCost
      order,                  // asc | desc (si no se pasa, elegimos)
      limit = 5,
      periodDays
    } = req.query;

    const userId = req.user._id;

    const match = { userId: new mongoose.Types.ObjectId(userId) };
    if (periodDays) {
      const from = new Date();
      from.setDate(from.getDate() - Number(periodDays));
      match.createdAt = { $gte: from };
    }

    // Orden por defecto según la métrica
    const defaultOrder =
      metric === "totalCost" ? -1 : -1; // “top” suele ser descendente
    const sortDir = order === "asc" ? 1 : order === "desc" ? -1 : defaultOrder;

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
          // expectedProfit por receta (ventas estimadas de todas las porciones - costo total)
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

    const rows = await Recipe.aggregate(pipeline).exec();

    return res.json({
      metric,
      order: sortDir === 1 ? "asc" : "desc",
      rows // [{name, totalCost, netProfit, expectedProfit, metricValue}]
    });
  } catch (err) {
    console.error("Error en recipesRankings:", err);
    next(err);
  }
}
