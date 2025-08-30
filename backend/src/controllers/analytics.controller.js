import mongoose from "mongoose";
import Recipe from '../models/recipe.model.js';
import { toNum, sortData } from "../services/analytics.service.js"; // Importamos las funciones del servicio

export async function topRecipes(req, res, next) {
  try {
    const { metric = "profit", limit = 5, periodDays } = req.query;

    // Acceder al userId del usuario autenticado
    const userId = req.user._id;  // Aquí obtenemos el userId del usuario autenticado

    // Creamos el filtro para la consulta (filtramos por userId)
    const match = { userId: new mongoose.Types.ObjectId(userId) }; 

    if (periodDays) {
      const from = new Date();
      from.setDate(from.getDate() - Number(periodDays)); // Filtramos por los últimos N días
      match.createdAt = { $gte: from };
    }

    // Realiza la consulta a la base de datos
    const rows = await Recipe.find(match, {
      name: 1,
      netProfit: 1,
      profitPercentage: 1,
      totalCost: 1,
      unitSalePrice: 1
    }).lean();

    // Procesa los números usando la función toNum del servicio
    const withNums = rows.map(r => ({
      ...r,
      netProfitNum: toNum(r.netProfit),
      profitPercentageNum: toNum(r.profitPercentage)
    }));

    // Ordena los resultados usando la función sortData del servicio
    const sortedRows = sortData(withNums, metric);

    // Limita la cantidad de resultados
    const top = sortedRows.slice(0, Number(limit));

    // Devuelve los datos procesados para la gráfica
    return res.json({
      labels: top.map(r => r.name),
      datasets: [{
        label: metric === "margin" ? "Margen (%)" : "Ganancia neta",
        data: top.map(r => metric === "margin" ? r.profitPercentageNum : r.netProfitNum)
      }],
      raw: top
    });
  } catch (err) {
    next(err); // Manejo de errores
  }
}
