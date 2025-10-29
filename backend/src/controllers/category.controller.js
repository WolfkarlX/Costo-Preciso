import Recipe from "../models/recipe.model.js"
import Category from "../models/category.model.js"
import mongoose from "mongoose";

//logic of creating a category
export const createCategory = async (req, res) => {
    try {

        if( !req.body ){
            return res.status(400).json({ message: "Petición vacía" });
        }

        const userId = req.user._id;

        const { name } = req.body;

        if ( !name ) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const category = await Category.findOne({ name, userId });
      
        if(category){
            return res.status(409).json({ 
                message: "La Categoría ya existe" 
            });
        }

        const newCategory = new Category({
            name,
            userId
        });

        if (newCategory) {
            await newCategory.save();
          
            res.status(201).json({
              _id: newCategory._id,
              name: newCategory.name,
              recipes: newCategory.recipes,
              userId: newCategory.userId
            });

        }else {
            return res.status(400).json({ message: "Datos de categoría inválidos" });
        }

    } catch (error) {

        console.error("Error in createCategory controller", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

//Get Categories of an loged in user Logic
export const getCategories = async (req, res) => {
    try {
        const userId = req.user._id;

        const userCategories = await Category.find({ userId: userId }).select("-userId");

        if (userCategories.length === 0){
            return res.status(404).json({ message: "No se encontrarón categorías" });
        }
          
        return res.status(200).json(userCategories);
    } catch (error) {
        console.error("Error in getCategories controller", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

export const getRecipes = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const { id:categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "ID no válida" });
        }

        const categoryRecipes = await Category.findOne({ userId: userId, _id: categoryId })
            .populate({
                path: 'recipes.recipeId',  // Populate the recipes array (recipeId field)
                select: '-userId',  // Exclude userId from the populated recipe data if needed
            });
    
        if (!categoryRecipes) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Extract the populated recipes from the category document
        const recipes = categoryRecipes.recipes.map(item => item.recipeId);

        if (recipes.length === 0) {
            return res.status(404).json({ message: 'No se encuentran recetas dentro de esta categoría' });
        }

        // Return the populated recipes
        return res.status(200).json(recipes);
        
    } catch (error) {
        console.error("Error in getRecipes controller", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

//Get Just one category logic
export const getSpecificCategory = async (req, res) => {
    try {

        if(!req.params){
            return res.status(400).json({ message: "Petición vacía" });
        }

        const userId = req.user._id;
        const { id:categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "ID no válida" });
        }

        const userCategories = await Category.findOne({userId: userId, _id: categoryId}).select("-userId");
        
        if (!userCategories) {
            return res.status(404).json({ 
                message: "Categoría no encontrada o no autorizada" 
            });
        }

        return res.status(200).json(userCategories);

    } catch (error) {
        console.log("Error in getSpecificCategory Controller", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

//Logic for deleting Categories
export const deleteCategory = async (req, res) => {
    try {
        if(!req.params){
            return res.status(400).json({ message: "Petición vacía" });
        }
        const { id:categoryId } = req.params;
        const userId = req.user._id;
        
        //checks if id is in the correct structure
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "ID no válida" });
        }

        // Checks if the category exists AND belongs to the user
        const category = await Category.findOne({ 
            _id: categoryId, 
            userId: userId 
        });

        if (!category) {
            return res.status(404).json({ 
                message: "Categoría no encontrada o no autorizada"
            });
        }
          
        await Category.deleteOne({ _id: categoryId });

        return res.status(200).json({ message: "Categoría eliminada Exitosamente" });

    } catch (error) {
        console.error("Error in deleteCategory Controller:", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

//Logic for updating categories using filter
export const updateCategory = async (req, res) => {
    try {
        
        if( !req.body ){
            return res.status(400).json({ message: "Petición vacía" });
        }

        const { id: categoryId } = req.params;
        const userId = req.user._id;
        
        let { filteredUpdates } = req; // vienen los updates validados por middleware

        const category = await Category.findOne({ _id: categoryId, userId: userId });
        
        if (!category) {
            return res.status(404).json({ message: "Categoría no encontrado o no autorizado" });
        }

        // Recipes validations
        if (filteredUpdates.recipes) {
            if (!Array.isArray(filteredUpdates.recipes) || filteredUpdates.length === 0) {
                return res.status(400).json({ message: "La lista de recetas está vacía o es inválida." });
            }
        
            // 2. Validates if all the recipes ids are correct 
            const allIdsPresent = filteredUpdates.recipes.every(ing => ing.recipeId);
            if (!allIdsPresent) {
                return res.status(400).json({ message: "La receta no existe o no está autorizada." });
            }
                    
            const allIdsValid = filteredUpdates.recipes.every(ing => mongoose.Types.ObjectId.isValid(ing.recipeId));
            if (!allIdsValid) {
                return res.status(400).json({ message: "La receta no existe o no está autorizada." });
            }

            const categoriesIds = filteredUpdates.recipes.map(i => i.recipeId);
            const dbMaterials = await Recipe.find({ _id: { $in: categoriesIds } });
            
            if (!dbMaterials || dbMaterials.length !== categoriesIds.length){ 
                return res.status(400).json({ message: "Una o más recetas no existen o no están autorizadas" });
            }
        }
        
        //checks if the user updates to a name occupied
        if (filteredUpdates.name) {
            const SameName = await Category.findOne({
                name: filteredUpdates.name,
                userId: userId,
                _id: { $ne: categoryId } // excluye la categoria actual
            });
            
            if (SameName) {
                return res.status(409).json({ message: "La categoría ya existe" });
            }
        }
    
        //Apply updates (fields are pre-filtered)
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedCategory);
    } catch (error) {
        
        console.error("Error in updateCategory Controller:", error.message);
        // Handle validation errors (e.g., "quantity must be a number")
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "La validación falló" });
        }
        
        res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }

};
