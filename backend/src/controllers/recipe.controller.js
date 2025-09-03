import cloudinary from "../lib/cloudinary.js";
import Ingredient from "../models/ingredient.models.js";
import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";
import { calculateRecipeCost } from "../services/recipeCalculator.service.js";

// Logic for creating a recipe
export const createRecipe = async (req, res) => {
    const userId = req.user._id;
    let imageUrl = "";
    let publicId = "";

    const {
        name,
        ingredients,
        portionsPerrecipe,
        aditionalCostpercentages,
        profitPercentage,
        quantityPermeasure,
        recipeunitOfmeasure,
        image
    } = req.body;

    try {
        if (!name || !ingredients || !portionsPerrecipe || !aditionalCostpercentages || !profitPercentage || !quantityPermeasure || !recipeunitOfmeasure) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const materialIds = ingredients.map(i => i.materialId);
        const allValid = materialIds.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) return res.status(400).json({ message: "Ingredient does not exist or not authorized" });

        const invalidIngredient = ingredients.find(ing => !ing.units || Number(ing.units) <= 0);
        if (invalidIngredient) return res.status(400).json({ message: "Invalid Quantity or unauthorized" });

        const dbMaterials = await Ingredient.find({ _id: { $in: materialIds } });
        if (!dbMaterials || dbMaterials.length !== materialIds.length) return res.status(400).json({ message: "One or more ingredients do not exist" });

        const costData = calculateRecipeCost({
            ingredientsData: dbMaterials,
            recipeIngredients: ingredients,
            additionalCostPercentage: aditionalCostpercentages,
            profitPercentage,
            portions: portionsPerrecipe
        });

        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: 'recipes',
                    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
                    max_file_size: 5 * 1024 * 1024,
                    invalidate: true
                });
                imageUrl = uploadResponse.secure_url;
                publicId = uploadResponse.public_id;
            } catch (err) {
                console.error('Cloudinary upload error:', err.message);
                return res.status(400).json({ message: 'Invalid image. Must be JPG/PNG/GIF under 5MB.' });
            }
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

        await newRecipe.save();

        res.status(201).json(newRecipe);

    } catch (error) {
        console.error("Error in createRecipe controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get recipes for logged-in user
export const getRecipes = async (req, res) => {
    try {
        const userRecipes = await Recipe.find({ userId: req.user._id }).select("-userId");
        res.status(200).json(userRecipes);
    } catch (error) {
        console.error("Error in getRecipes controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get specific recipe
export const getSpecificrecipe = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

        const recipe = await Recipe.findOne({ _id: id, userId: req.user._id }).select("-userId");
        if (!recipe) return res.status(404).json({ message: "Recipe not found or unauthorized" });

        res.status(200).json(recipe);
    } catch (error) {
        console.error("Error in getSpecificRecipe controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete recipe and image
export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

        const recipe = await Recipe.findOne({ _id: id, userId: req.user._id });
        if (!recipe) return res.status(404).json({ message: "Recipe not found or unauthorized" });

        // Delete image from Cloudinary if exists
        if (recipe.publicId) {
            try {
                await cloudinary.uploader.destroy(recipe.publicId);
            } catch (err) {
                console.error("Error deleting Cloudinary image:", err.message);
            }
        }

        await Recipe.deleteOne({ _id: id });
        res.status(200).json({ message: "Recipe deleted successfully" });

    } catch (error) {
        console.error("Error in deleteRecipe controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
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
            image
        } = req.body; // <-- aquí lees la info correctamente
        const userId = req.user._id;

        const recipe = await Recipe.findOne({ _id: id, userId });
        if (!recipe) return res.status(404).json({ message: "Recipe not found or unauthorized" });

        const filteredUpdates = {
            name,
            ingredients,
            portionsPerrecipe,
            aditionalCostpercentages,
            profitPercentage,
            quantityPermeasure,
            recipeunitOfmeasure
        };

        // Subir nueva imagen si se proporcionó
        if (image) {
            try {
                // borrar imagen anterior si existe
                if (recipe.publicId) await cloudinary.uploader.destroy(recipe.publicId);

                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: 'recipes',
                    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
                    max_file_size: 5 * 1024 * 1024,
                    invalidate: true
                });

                filteredUpdates.imageUrl = uploadResponse.secure_url;
                filteredUpdates.publicId = uploadResponse.public_id;

            } catch (err) {
                console.error('Cloudinary upload error:', err.message);
                return res.status(400).json({ message: 'Invalid image. Must be JPG/PNG/GIF under 5MB.' });
            }
        }

        // Calcular costos si cambian los ingredientes
        if (filteredUpdates.ingredients) {
            const materialIds = filteredUpdates.ingredients.map(i => i.materialId);
            const dbMaterials = await Ingredient.find({ _id: { $in: materialIds } });

            if (!dbMaterials || dbMaterials.length !== materialIds.length) 
                return res.status(400).json({ message: "One or more ingredients do not exist or not authorized" });

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
        console.error("Error in updateRecipe controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
