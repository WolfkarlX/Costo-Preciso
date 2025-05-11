import Recipe from "../models/recipe.js";
import Material from "../models/material.js";

// Crear receta
export const createRecipe = async (req, res) => {
  try {
    const { title, materials } = req.body;

    // Calcular el costo total basado en los materiales seleccionados y sus cantidades
    let totalCost = 0;

    for (const materialItem of materials) {
      const material = await Material.findById(materialItem.materialId);
      if (material) {
        let materialCost = 0;

        if (material.unit === "kg" || material.unit === "litros") {
          materialCost = (material.price / material.totalContent) * materialItem.quantity;
        } else if (material.unit === "gramos" || material.unit === "mililitros") {
          materialCost = (material.price / material.totalContent) * (materialItem.quantity * 1000);
        } else if (material.unit === "unidades") {
          materialCost = (material.price / material.totalContent) * materialItem.quantity;
        }

        totalCost += materialCost;
      }
    }

    const newRecipe = new Recipe({
      title,
      materials,
      cost: totalCost,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error al crear receta:", error.message);
    res.status(400).json({ message: "Error al crear receta" });
  }
};

// Obtener todas las recetas
export const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("materials.materialId");
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error al obtener recetas:", error.message);
    res.status(500).json({ message: "Error al obtener recetas" });
  }
};

// Eliminar receta
export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecipe = await Recipe.findByIdAndDelete(id);

    if (!deletedRecipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    res.status(200).json({ message: "Receta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar receta:", error.message);
    res.status(500).json({ message: "Error al eliminar receta" });
  }
};

// Actualizar receta
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, materials } = req.body;

    // Calcular el nuevo costo basado en los materiales seleccionados y sus cantidades
    let totalCost = 0;

    for (const materialItem of materials) {
      const material = await Material.findById(materialItem.materialId);
      if (material) {
        let materialCost = 0;

        if (material.unit === "kg" || material.unit === "litros") {
          materialCost = (material.price / material.totalContent) * materialItem.quantity;
        } else if (material.unit === "gramos" || material.unit === "mililitros") {
          materialCost = (material.price / material.totalContent) * (materialItem.quantity * 1000);
        } else if (material.unit === "unidades") {
          materialCost = (material.price / material.totalContent) * materialItem.quantity;
        }

        totalCost += materialCost;
      }
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, {
      title,
      materials,
      cost: totalCost,
    }, { new: true, runValidators: true });

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("Error al actualizar receta:", error.message);
    res.status(500).json({ message: "Error al actualizar receta" });
  }
};

// Obtener todos los materiales
export const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find({}, "name price unit");
    res.status(200).json(materials);
  } catch (error) {
    console.error("Error al obtener materiales:", error.message);
    res.status(500).json({ message: "Error al obtener materiales" });
  }
};
