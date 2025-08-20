import { getTopRecipes } from "../services/analytics.service.js";

export async function topRecipes(req, res, next) {
  try {
    const { metric = "profit", limit = 5, periodDays, userId } = req.query;
    const rows = await getTopRecipes({ metric, limit, periodDays, userId });

    return res.json({
      labels: rows.map(r => r.name),
      datasets: [{
        label: metric === "margin" ? "Margen (%)" : "Ganancia neta",
        data: rows.map(r => metric === "margin" ? r.profitPercentageNum : r.netProfitNum)
      }],
      raw: rows
    });
  } catch (err) { next(err); }
}
