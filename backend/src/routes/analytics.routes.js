import { Router } from 'express';
import { topRecipes } from '../controllers/analytics.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js'; // Importa el middleware de autenticación

const router = Router();

// Aplicar el middleware `protectRoute` para que solo los usuarios autenticados puedan acceder
router.get('/top-recipes', protectRoute, topRecipes);  // Asegúrate de colocar protectRoute antes de topRecipes

export default router;
