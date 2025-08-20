import { Router } from 'express';
import { topRecipes } from '../controllers/analytics.controller.js';

const router = Router();

// GET /api/analytics/top-recipes?metric=profit|margin&limit=5&periodDays=30&userId=...
router.get('/top-recipes', topRecipes);

export default router;
