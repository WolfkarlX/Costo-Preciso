import { convertUnits } from "./convertUnits.service.js";

export function calculateRecipeCost({ ingredientsData, recipeIngredients, additionalCostPercentage, profitPercentage, portions }) {
  let materialCostTotal = 0;

  const ingredientCosts = recipeIngredients.map(ingredient => {
    const dbMaterial = ingredientsData.find(mat => mat._id.toString() === ingredient.materialId);

    if (!dbMaterial) throw new Error(`Material with ID ${ingredient.materialId} not found.`);

    // Change the ingredient unity to the db unity

    const quantityUsed = convertUnits(
      parseFloat(ingredient.units),
      ingredient.UnitOfmeasure,
      dbMaterial.unityOfmeasurement
    );

    const costPerUnit = parseFloat(dbMaterial.unityPrice);
    const cost = costPerUnit * quantityUsed;

    materialCostTotal += cost;

    return {
      ...ingredient,
      name: dbMaterial.name,
      unitPrice: costPerUnit,
      quantityUsed,
      cost
    };
  });

  const additionalCostDecimal = parseFloat(additionalCostPercentage) / 100;
  const additionalCost = materialCostTotal * additionalCostDecimal;

  const totalCost = materialCostTotal + additionalCost;

  const unitCost = totalCost / parseFloat(portions);

  const profitDecimal = parseFloat(profitPercentage) / 100;
  const grossProfit = (totalCost * profitDecimal) + totalCost;
  const unitSalePrice = grossProfit / parseFloat(portions);
  const netProfit = grossProfit - totalCost;

  return {
    ingredientCosts,
    materialCostTotal,
    additionalCost,
    totalCost,
    unitCost,
    grossProfit,
    unitSalePrice,
    netProfit
  };
}
