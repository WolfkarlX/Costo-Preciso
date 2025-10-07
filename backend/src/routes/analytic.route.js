import express from "express";
import { recipesRankings} from '../controllers/analytics.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js'; // Importa el middleware de autenticación

const router = express.Router();

// Aplicar el middleware `protectRoute` para que solo los usuarios autenticados puedan acceder
router.get('/recipes-rankings', protectRoute, recipesRankings);  // Asegúrate de colocar protectRoute antes de topRecipes

export default router;
