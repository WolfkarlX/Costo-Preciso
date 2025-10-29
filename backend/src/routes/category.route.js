import express from "express";
import { createCategory, getCategories, getRecipes, getSpecificCategory, deleteCategory, updateCategory} from "../controllers/category.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validateAndFilterUpdates } from "../middleware/util.middleware.js";


const router = express.Router();
const allowedxUpdates = ['name', 'recipes'];

router.post("/create", protectRoute, createCategory);
router.get("/categories", protectRoute, getCategories);
router.get("/category/:id", protectRoute, getSpecificCategory);
router.get("/category/recipes/:id", protectRoute, getRecipes);
router.delete("/del/:id", protectRoute, deleteCategory);
router.patch("/updt/:id", protectRoute, validateAndFilterUpdates(allowedxUpdates), updateCategory);//the controller is not checking if the recipes are valid, check the recipes controller to see how it works

export default router;