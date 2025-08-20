import mongoose from "mongoose";
import Recipe from '../models/recipe.model.js';

// util seguro para convertir tus strings con $, %, comas, etc. a número
function toNum(val) {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val !== "string") return Number(val) || 0;
  const cleaned = val.replace(/[^\d.\-]/g, ""); // quita $, %, comas, espacios
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Top recetas por ganancia ('profit') o por margen ('margin')
 * - userId (opcional), periodDays (opcional), limit (por defecto 5)
 */
export async function getTopRecipes({ metric = "profit", userId, periodDays, limit = 5 }) {
  const match = {};
  if (userId) match.userId = new mongoose.Types.ObjectId(userId);
  if (periodDays) {
    const from = new Date();
    from.setDate(from.getDate() - Number(periodDays));
    match.createdAt = { $gte: from };
  }

  // Trae solo los campos que usaremos
  const rows = await Recipe.find(match, {
    name: 1,
    netProfit: 1,
    profitPercentage: 1,
    totalCost: 1,
    unitSalePrice: 1
  }).lean();

  // Calcula números en JS y ordena
  const withNums = rows.map(r => ({
    ...r,
    netProfitNum: toNum(r.netProfit),
    profitPercentageNum: toNum(r.profitPercentage)
  }));

  withNums.sort((a, b) => {
    if (metric === "margin") return b.profitPercentageNum - a.profitPercentageNum;
    return b.netProfitNum - a.netProfitNum; // default profit
  });

  const top = withNums.slice(0, Number(limit));

  return top;
}
