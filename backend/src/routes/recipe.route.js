import express from "express";
import {
    createRecipe,
    getRecipes,
    updateRecipe,
    deleteRecipe
} from "../controllers/recipe.controller.js";

const router = express.Router();

// Crear una receta
router.post("/", createRecipe);

// Obtener todas las recetas
router.get("/all", getRecipes);

// Actualizar una receta
router.put("/:id", updateRecipe);

// Eliminar una receta
router.delete("/:id", deleteRecipe);

export default router;