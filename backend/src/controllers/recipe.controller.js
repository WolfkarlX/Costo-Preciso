import Recipe from "../models/recipe.js";

// Crear receta
export const createRecipe = async (req, res) => {
    try {
        const recipe = new Recipe(req.body);
        await recipe.save();

        res.status(201).json(recipe);
    } catch (error) {
        console.error("Error al crear receta:", error.message);
        res.status(400).json({ message: "Error al crear receta" });
    }
};

// Obtener todas las recetas
export const getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find();

        res.status(200).json(recipes);
    } catch (error) {
        console.error("Error al obtener recetas:", error.message);
        res.status(500).json({ message: "Error al obtener recetas" });
    }
};

export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        await Recipe.findByIdAndDelete(id);
        res.status(200).json({ message: "Receta eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar receta:", error.message);
        res.status(500).json({ message: "Error al eliminar receta" });
    }
};

export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRecipe = await Recipe.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedRecipe) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }
        res.status(200).json(updatedRecipe);
    } catch (error) {
        console.error("Error al actualizar receta:", error.message);
        res.status(500).json({ message: "Error al actualizar receta" });
    }
};
