export const unitAliases = {
  // Volume
  'milliliter': 'ml', 'milliliters': 'ml', 'mls': 'ml', 'ml': 'ml',
  'liter': 'l', 'liters': 'l', 'litre': 'l', 'litres': 'l', 'litro':'l', 'l': 'l',
  'cup': 'cup', 'cups': 'cup', 'c': 'cup', 'cup': 'cup',
  'tablespoon': 'tbsp', 'tablespoons': 'tbsp', 'tbsp': 'tbsp', 'tbs': 'tbsp',
  'teaspoon': 'tsp', 'teaspoons': 'tsp', 'tsp': 'tsp',
  'fluid ounce': 'fl oz', 'fluid ounces': 'fl oz', 'fl oz': 'fl oz', 'floz': 'fl oz',
  'gallon': 'gal', 'gallons': 'gal', 'gal': 'gal',

  // Weight
  'milligram': 'mg', 'milligrams': 'mg', 'mg': 'mg', 'mg': 'mg',
  'gram': 'g', 'grams': 'g', 'gr': 'g', 'gms': 'g', 'gramo': 'g', 'g': 'g',
  'kilogram': 'kg', 'kilograms': 'kg', 'kilo': 'kg', 'kilos': 'kg', 'kilogramo': 'kg', 'kg': 'kg',
  'pound': 'lb', 'pounds': 'lb', 'lbs': 'lb', '#': 'lb',
  'ounce': 'oz', 'ounces': 'oz', 'oz': 'oz',

  // Pieces
  'piece': 'pz', 'pieces': 'pz', 'pz': 'pz', 'pza': 'pz', 'pieza': 'pz', 'piezas': 'pz', 'pz': 'pz',
};

export const conversionFactors = {
  // Weight to gr
  'mg': 0.001,
  'g': 1,
  'kg': 1000,
  'lb': 453.592,
  'oz': 28.3495,

  // Volume to litres
  'ml': 0.001,
  'l': 1,
  'cup': 0.24,
  'tbsp': 0.015,
  'tsp': 0.005,
  'fl oz': 0.0295735,
  'gal': 3.78541,

  // Pieces: factor 1 because it does not change or transform
  'pz': 1
};

/**
 * Changes the quantity to an unity compatible 
 * @param {number} quantity - Original Quantity
 * @param {string} fromUnit - Original Unity (variable)
 * @param {string} toUnit - Objective Unit (estándar)
 * @returns {number} Transformed Quantity
 */
export function convertUnits(quantity, fromUnit, toUnit) {
  const from = unitAliases[fromUnit.toLowerCase()];
  const to = unitAliases[toUnit.toLowerCase()];

  if (!from || !to) throw new Error(`Unity Unknown: ${fromUnit} to ${toUnit}`);

  // if both are pieces, do not change
  if (from === 'pz' && to === 'pz') return quantity;

  if (from === to) return quantity;
  
  //checks if there is a piece
  if (from === 'pz' || to === 'pz'){
    throw new Error(`it is not possible to convert Volume, Weight and pieces: ${fromUnit} to ${toUnit}`);
  }

  const weightUnits = ['mg','g','kg','lb','oz'];
  const volumeUnits = ['ml','l','cup','tbsp','tsp','fl oz','gal'];

  const fromIsWeight = weightUnits.includes(from);
  const toIsWeight = weightUnits.includes(to);
  const fromIsVolume = volumeUnits.includes(from);
  const toIsVolume = volumeUnits.includes(to);

  if ((fromIsWeight && toIsWeight)) {
    const quantityInGrams = quantity * conversionFactors[from];
    return quantityInGrams / conversionFactors[to];
  }

  if ((fromIsVolume && toIsVolume)) {
    const quantityInLiters = quantity * conversionFactors[from];
    return quantityInLiters / conversionFactors[to];
  }

  throw new Error(`it is not possible to convert Volume, Weight and pieces: ${fromUnit} to ${toUnit}`);
}
