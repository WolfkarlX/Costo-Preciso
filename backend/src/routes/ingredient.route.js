import express from "express";
import { createIngredient, deleteIngredient, getIngredients, updateIngredient } from "../controllers/ingredient.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validateAndFilterUpdates } from "../middleware/util.middleware.js";

const router = express.Router();
const allowedxUpdates = ['name', 'pricePerunit', 'unitOfmeasurement', 'image'];

router.post("/create", protectRoute, createIngredient);
router.get("/ingredients", protectRoute, getIngredients);
router.delete("/del/:id", protectRoute, deleteIngredient);
router.post("/updt/:id", protectRoute, validateAndFilterUpdates(allowedxUpdates), updateIngredient);

export default router;