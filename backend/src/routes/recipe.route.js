import express from "express";
import { createRecipe } from "../controllers/recipe.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validateAndFilterUpdates } from "../middleware/util.middleware.js";

const router = express.Router();
const allowedxUpdates = ['name', 'Units', 'unityOfmeasurement', 'totalPrice', 'image'];

router.post("/create", protectRoute, createRecipe);
//router.get("/recipes", protectRoute, getIngredients);
//router.delete("/del/:id", protectRoute, deleteIngredient);
//router.post("/updt/:id", protectRoute, validateAndFilterUpdates(allowedxUpdates), updateIngredient);

export default router;