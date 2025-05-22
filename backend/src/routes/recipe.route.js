import express from "express";
import { createRecipe, deleteRecipe, getRecipes, updateRecipe } from "../controllers/recipe.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validateAndFilterUpdates } from "../middleware/util.middleware.js";

const router = express.Router();
const allowedxUpdates = ['name', 'ingredients', 'portionsPerrecipe', 'aditionalCostpercentages'
                        , 'profitPercentage', 'quantityPermeasure', 'recipeunitOfmeasure', 'image'];

router.post("/create", protectRoute, createRecipe);
router.get("/recipes", protectRoute, getRecipes);
router.delete("/del/:id", protectRoute, deleteRecipe);
router.post("/updt/:id", protectRoute, validateAndFilterUpdates(allowedxUpdates), updateRecipe);

export default router;