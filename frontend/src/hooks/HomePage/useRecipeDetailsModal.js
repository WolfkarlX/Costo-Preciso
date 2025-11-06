import { useState, useEffect, useCallback } from "react";

export function useRecipeDetailsModal(recipeData) {
  const [isopen, setIsOpen] = useState(false);
  const [selectedOne, setSelectedRecipe] = useState(null);

  const openModal = useCallback((recipeData) => {
    setSelectedRecipe(recipeData);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedRecipe(null);
  }, []);

  // Watch the specific fields
  useEffect(() => {
    const { profitPercentage, aditionalCostpercentages, totalCost, materialCostTotal } = recipeData || {};

    // safely parse everything
    const profit = parseFloat(profitPercentage);
    const additional = parseFloat(aditionalCostpercentages);
    const cost = parseFloat(totalCost);
    const materialCost = parseFloat(materialCostTotal);

    // check all values are valid numbers
    const validProfit = !isNaN(profit);
    const validAdditional = !isNaN(additional);
    const validCost = !isNaN(cost);
    const validMaterial = !isNaN(materialCost);

    if (validProfit && validAdditional && validCost && validMaterial) {
      const profitDecimal = profit / 100;
      let netProfit = cost * (profitDecimal);
      netProfit = Math.round(netProfit * 100) / 100; // float

      const additionalCostDecimal = additional / 100;
      let additionalCost = materialCost * additionalCostDecimal;
      additionalCost = Math.round(additionalCost * 100) / 100; // float

      console.log(netProfit);
      console.log(recipeData);

      openModal({
        profitPercentage: profit,
        aditionalCostpercentages: additional,
        netProfit,
        additionalCost
      });
    }
  }, [
    recipeData?.profitPercentage,
    recipeData?.aditionalCostpercentages,
    recipeData?.totalCost,
    recipeData?.materialCostTotal
]);

return { isopen, selectedOne, openModal, closeModal };
}
