import express from "express";
import { getAllIngredients } from "../controllers/recipe.controller.js";

const router = express.Router();

router.get("/", getAllIngredients); // GET /api/ingredients

export default router;
