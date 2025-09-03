import mongoose from "mongoose";
import Recipe from '../models/recipe.model.js';
import Ingredient from '../models/ingredient.models.js'; // Asegúrate de que este sea el modelo correcto
import { toNum, sortData } from "../services/analytics.service.js"; // Importamos las funciones del servicio

export async function topRecipes(req, res, next) {
  try {
    const { metric = "profit", limit = 5, periodDays } = req.query;

    // Acceder al userId del usuario autenticado
    const userId = req.user._id;  // Aquí obtenemos el userId del usuario autenticado
    console.log("User ID:", userId);  // Verifica que el userId sea correcto

    // Creamos el filtro para la consulta (filtramos por userId)
    const match = { userId: new mongoose.Types.ObjectId(userId) };

    if (periodDays) {
      const from = new Date();
      from.setDate(from.getDate() - Number(periodDays)); // Filtramos por los últimos N días
      match.createdAt = { $gte: from };
    }

    // Realiza la consulta a la base de datos para obtener las recetas
    const rows = await Recipe.find(match, {
      name: 1,
      totalCost: 1,
      ingredients: 1,  // Obtenemos los ingredientes
    }).lean();
    
    console.log("Rows from Recipe:", rows);  // Verifica los datos que vienen de las recetas

    // Preparamos los datos para el gráfico de ingredientes
    const dataForPieChart = rows.map(async (recipe) => {
      const totalCost = toNum(recipe.totalCost); // Asegurándonos de que sea un número
      console.log("Total Cost for recipe", recipe.name, ":", totalCost);

      const ingredientsCost = await Promise.all(recipe.ingredients.map(async (ingredient) => {
        // Buscamos el precio por unidad del ingrediente
        const ingredientData = await Ingredient.findById(ingredient.materialId); // Aquí obtenemos la información del ingrediente desde la base de datos

        if (!ingredientData) {
          console.error(`Ingrediente con ID ${ingredient.materialId} no encontrado.`);
          return {
            ingredient: 'Desconocido', 
            cost: 0,
            percentage: 0
          };
        }

        const ingredientCost = toNum(ingredientData.unityPrice) * toNum(ingredient.units); // Calcular el costo de este ingrediente
        const percentage = (ingredientCost / totalCost) * 100; // Porcentaje de costo de este ingrediente

        return {
          ingredient: ingredientData.name,  // Nombre del ingrediente
          cost: ingredientCost,
          percentage: percentage,
        };
      }));

      // Filtrar ingredientes con porcentaje 0 si no fueron encontrados
      const validIngredients = ingredientsCost.filter(item => item.percentage > 0);

      return {
        recipeName: recipe.name,
        ingredientsCost: validIngredients,
      };
    });

    // Esperamos a que todas las promesas se resuelvan
    const finalData = await Promise.all(dataForPieChart);

    // Verifica los datos antes de enviarlos
    console.log("Final data for Pie Chart:", finalData);

    // Devuelve los datos procesados para el gráfico
    return res.json({
      dataForPieChart: finalData,
    });
  } catch (err) {
    console.error("Error en el controlador:", err);  // Verifica el error en el servidor
    next(err); // Manejo de errores
  }
}
