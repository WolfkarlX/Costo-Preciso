import cloudinary from "../lib/cloudinary.js";
import Ingredient from "../models/ingredient.models.js";
import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";
import { calculateRecipeCost } from "../services/recipeCalculator.service.js";

// Logic for creating a recipe
export const createRecipe = async (req, res) => {
    try {
        const userId = req.user._id;
        let imageUrl = "";
        let publicId = "";

        const {
            name,
            ingredients, // Object Array { materialId, units, UnitOfmeasure }
            portionsPerrecipe,
            aditionalCostpercentages,
            profitPercentage,
            quantityPermeasure,
            recipeunitOfmeasure,
            image
        } = req.body;

        if (!name || !ingredients || !portionsPerrecipe || !aditionalCostpercentages || !profitPercentage || !quantityPermeasure || !recipeunitOfmeasure) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        // Search for all the necessary ingredients
        const materialIds = ingredients.map(i => i.materialId);
        
        // Checks if the id of the ingredients are real or valid
        const allValid = materialIds.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) {
             return res.status(400).json({ message: "El ingrediente no existe o no está autorizado" });
        }
        
        // Checks if there is at least one ingredient
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ message: "La receta debe tener al menos 1 ingrediente" });
        }

        // Checks if the ingredient unity is real or grater than 0
        const invalidIngredient = ingredients.find(ing => {
            return !ing.units || Number(ing.units) <= 0;
        });

        if (invalidIngredient) return res.status(400).json({ message: "Cantidad de ingredientes inválida o no autorizada" });

        // Checks for the id within the object 
        const dbMaterials = await Ingredient.find({ _id: { $in: materialIds } });

        // Checks if the material does not exists
        if (!dbMaterials || dbMaterials.length !== materialIds.length) {
            return res.status(400).json({ message: "Uno o más ingredientes no existen o no están autorizados" });
        }

        // Calculate costs
        const costData = calculateRecipeCost({
            ingredientsData: dbMaterials,
            recipeIngredients: ingredients,
            additionalCostPercentage: aditionalCostpercentages,
            profitPercentage,
            portions: portionsPerrecipe
        });

        // if there is image it uploads it to cloudinary
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: 'recipes',
                    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
                    max_file_size: 5 * 1024 * 1024,
                    invalidate: true
                });
                imageUrl = uploadResponse.secure_url;
                publicId = uploadResponse.public_id;
            } catch (err) {
                console.error('Cloudinary upload error:', err.message);
                return res.status(400).json({ message: 'Imagen inválida. Debe ser JPG/PNG/JPEG/GIF/WEBP y pesar menos de 5MB' });
            }
        }

        const recipe = await Recipe.findOne({ name, userId });
      
        if(recipe){
            return res.status(409).json({ 
                message: "La receta ya existe" 
            });
        }

        const newRecipe = new Recipe({
            name,
            profitPercentage,
            aditionalCostpercentages,
            netProfit: costData.netProfit.toFixed(2),
            totalCost: costData.totalCost.toFixed(2),
            costPerunity: costData.unitCost.toFixed(2),
            additionalCost: costData.additionalCost.toFixed(2),
            materialCostTotal: costData.materialCostTotal.toFixed(2),
            grossProfit: costData.grossProfit.toFixed(2),
            unitSalePrice: costData.unitSalePrice.toFixed(2),
            portionsPerrecipe,
            quantityPermeasure,
            recipeunitOfmeasure,
            ingredients,
            userId,
            imageUrl,
            publicId
        });

        if (newRecipe) {
            await newRecipe.save();
          
            res.status(201).json({
              _id: newRecipe._id,
              name: newRecipe.name,
              profitPercentage: newRecipe.profitPercentage,
              aditionalCostpercentages: newRecipe.aditionalCostpercentages,
              netProfit: newRecipe.netProfit,
              totalCost: newRecipe.totalCost,
              costPerunity: newRecipe.costPerunity,
              additionalCost: newRecipe.additionalCost,
              materialCostTotal: newRecipe.materialCostTotal,
              grossProfit: newRecipe.grossProfit,
              unitSalePrice: newRecipe.unitSalePrice,
              portionsPerrecipe: newRecipe.portionsPerrecipe,
              quantityPermeasure: newRecipe.quantityPermeasure,
              recipeunitOfmeasure: newRecipe.recipeunitOfmeasure,
              ingredients: newRecipe.ingredients,
              userId: newRecipe.userId,
              imageUrl: newRecipe.imageUrl,
              publicId: newRecipe.publicId
            });
        }else{
            res.status(400).json({ message: "Datos de receta inválidos" });
        }

    } catch (error) {
        
        // Handles errors from services and server errors
        if (error.message.startsWith("No es posible convertir entre Volumen, Peso y Piezas:")) {
            return res.status(400).json({ message: error.message });
        }
        
        if (error.message.startsWith("Material con nombre:")) {
            return res.status(400).json({ message: error.message });
        }
       
        if (error.message.startsWith("Unidad desconocida")) {
            return res.status(400).json({ message: error.message });
        }

        console.error("Error in createRecipe controller", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

//Get recipes from a logged in user
export const getRecipes = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRecipes = await Recipe.find({userId: userId}).select("-userId");

        return res.status(200).json(userRecipes);

    } catch (error) {
        // Handles errors from services and server errors
        if (error.message.startsWith("No es posible convertir entre Volumen, Peso y Piezas:")) {
            return res.status(400).json({ message: error.message });
        }
        
        if (error.message.startsWith("Material con nombre:")) {
            return res.status(400).json({ message: error.message });
        }
       
        if (error.message.startsWith("Unidad desconocida")) {
            return res.status(400).json({ message: error.message });
        }

        console.error("Error in getRecipes controller", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

// Get specific recipe
export const getSpecificrecipe = async (req, res) => {
    try {
        if(!req.params){
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        const userId = req.user._id;
        const {id:recipeId} = req.params;

        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: "ID no válida" });
        }

        const userRecipe = await Recipe.findOne({userId: userId, _id: recipeId}).select("-userId");

        if (!userRecipe) {
            return res.status(404).json({ 
                message: "Receta no encontrada o inautorizada" 
            });
        }

        res.status(201).json({
            _id: userRecipe._id,
            name: userRecipe.name,
            profitPercentage: userRecipe.profitPercentage,
            aditionalCostpercentages: userRecipe.aditionalCostpercentages,
            netProfit: userRecipe.netProfit,
            totalCost: userRecipe.totalCost,
            costPerunity: userRecipe.costPerunity,
            additionalCost: userRecipe.additionalCost,
            materialCostTotal: userRecipe.materialCostTotal,
            grossProfit: userRecipe.grossProfit,
            unitSalePrice: userRecipe.unitSalePrice,
            portionsPerrecipe: userRecipe.portionsPerrecipe,
            quantityPermeasure: userRecipe.quantityPermeasure,
            recipeunitOfmeasure: userRecipe.recipeunitOfmeasure,
            ingredients: userRecipe.ingredients,
            imageUrl: userRecipe.imageUrl,
            publicId: userRecipe.publicId
        });

    } catch (error) {
        console.error("Error in getSpecificingredient Controller", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

// Delete recipe and image
export const deleteRecipe = async (req, res) => {
    try {
        if(!req.params){
            return res.status(500).json({ message: "Solicitud vacía" });
        }
        const {id:recipeId} = req.params;
        const userId = req.user._id;

        //checks if id is in the correct structure
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: "ID no válida" });
        }

        // Checks if the recipe exists AND belongs to the user
        const recipe = await Recipe.findOne({ 
            _id: recipeId, 
            userId: userId 
        });

        if (!recipe) {
            return res.status(404).json({ 
                message: "Receta no encontrada o no autorizada" 
            });
        }

        // Delete image from Cloudinary if exists
        if (recipe.publicId) {
            try {
                await cloudinary.uploader.destroy(recipe.publicId);
            } catch (err) {
                console.error("Error deleting Cloudinary image:", err.message);
            }
        }

        await Recipe.deleteOne({ _id: recipeId });
        res.status(200).json({ message: "Receta eliminada con Éxito" });

    } catch (error) {
        console.error("Error in deleteRecipe controller:", error.message);
        res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

// Update recipe including image
export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            ingredients,
            portionsPerrecipe,
            aditionalCostpercentages,
            profitPercentage,
            quantityPermeasure,
            recipeunitOfmeasure,
            image,
        } = req.body;
        const userId = req.user._id;

        const recipe = await Recipe.findOne({ _id: id, userId });
        if (!recipe) return res.status(404).json({ message: "Receta no encontrada o no autorizada" });

        const filteredUpdates = {
            name,
            ingredients,
            portionsPerrecipe,
            aditionalCostpercentages,
            profitPercentage,
            quantityPermeasure,
            recipeunitOfmeasure,
        };

        // Borrar imagen si el cliente manda null
        if (image === null) {
            if (recipe.publicId) {
                try {
                    await cloudinary.uploader.destroy(recipe.publicId);
                } catch (err) {
                    console.error("Error deleting Cloudinary image:", err.message);
                }
            }
            filteredUpdates.imageUrl = "";
            filteredUpdates.publicId = "";
        }

        // Subir nueva imagen si se proporcionó en base64
        else if (image) {
            try {
                if (recipe.publicId) await cloudinary.uploader.destroy(recipe.publicId);

                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: 'recipes',
                    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
                    max_file_size: 5 * 1024 * 1024,
                    invalidate: true
                });

                filteredUpdates.imageUrl = uploadResponse.secure_url;
                filteredUpdates.publicId = uploadResponse.public_id;

            } catch (err) {
                console.error('Cloudinary upload error:', err.message);
                return res.status(400).json({ message: 'Imagen inválida. Debe ser JPG/PNG/JPEG/GIF/WEBP y pesar menos de 5MB' });
            }
        }

            // Calcular costos si cambian los ingredientes
            if (filteredUpdates.ingredients) {
                if (!Array.isArray(filteredUpdates.ingredients) || filteredUpdates.ingredients.length === 0) {
                return res.status(400).json({ message: "La lista de ingredientes está vacía o es inválida." });
            }

                // 2. Validates if all the ingredinet ids are correct 
            const allIdsPresent = filteredUpdates.ingredients.every(ing => ing.materialId);
            if (!allIdsPresent) {
                return res.status(400).json({ message: "El ingrediente no existe o no está autorizado." });
            }
            
            const allIdsValid = filteredUpdates.ingredients.every(ing => mongoose.Types.ObjectId.isValid(ing.materialId));
            if (!allIdsValid) {
                return res.status(400).json({ message: "El ingrediente no existe o no está autorizado." });
            }
            
            // 3. Validate Quantity > 0 before going to the DB
            const invalidQuantity = filteredUpdates.ingredients.find(ing => !ing.units || Number(ing.units) <= 0);
            if (invalidQuantity) {
                return res.status(400).json({ message: "Cantidad inválida en uno o más ingredientes." });
            }

            const invalidUnitOfmeasure = filteredUpdates.ingredients.find(ing => !ing.UnitOfmeasure || Number(ing.UnitOfmeasure) <= 0);
            if (invalidUnitOfmeasure) {
                return res.status(400).json({ message: "Unidad de medida inválida en uno o más ingredientes." });
            }

            const materialIds = filteredUpdates.ingredients.map(i => i.materialId);
            const dbMaterials = await Ingredient.find({ _id: { $in: materialIds } });

            if (!dbMaterials || dbMaterials.length !== materialIds.length) 
                return res.status(400).json({ message: "Uno o más ingredientes no existen o no están autorizados" });

            if(!filteredUpdates.aditionalCostpercentages){
            filteredUpdates.aditionalCostpercentages = recipe.aditionalCostpercentages
            }

            if(!filteredUpdates.profitPercentage){
                filteredUpdates.profitPercentage = recipe.profitPercentage
            }

            if(!filteredUpdates.portionsPerrecipe){
                filteredUpdates.portionsPerrecipe = recipe.portionsPerrecipe
            }

            const costData = calculateRecipeCost({
                ingredientsData: dbMaterials,
                recipeIngredients: filteredUpdates.ingredients,
                additionalCostPercentage: filteredUpdates.aditionalCostpercentages || recipe.aditionalCostpercentages,
                profitPercentage: filteredUpdates.profitPercentage || recipe.profitPercentage,
                portions: filteredUpdates.portionsPerrecipe || recipe.portionsPerrecipe
            });

            filteredUpdates.netProfit = costData.netProfit.toFixed(2);
            filteredUpdates.totalCost = costData.totalCost.toFixed(2);
            filteredUpdates.costPerunity = costData.unitCost.toFixed(2);
            filteredUpdates.additionalCost = costData.additionalCost.toFixed(2);
            filteredUpdates.materialCostTotal = costData.materialCostTotal.toFixed(2);
            filteredUpdates.grossProfit = costData.grossProfit.toFixed(2);
            filteredUpdates.unitSalePrice = costData.unitSalePrice.toFixed(2);
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(id, { $set: filteredUpdates }, { new: true, runValidators: true });
        res.status(200).json(updatedRecipe);

    } catch (error) {
        
        // Handles errors from services and server errors
        if (error.message.startsWith("No es posible convertir entre Volumen, Peso y Piezas:")) {
            return res.status(400).json({ message: error.message });
        }
        
        if (error.message.startsWith("Material con nombre:")) {
            return res.status(400).json({ message: error.message });
        }
       
        if (error.message.startsWith("Unidad desconocida")) {
            return res.status(400).json({ message: error.message });
        }
        
        // Handle validation errors (e.g., "quantity must be a number")
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "La validación falló" });
        }

        console.error("Error in updateRecipe controller", error.message);

        res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};
