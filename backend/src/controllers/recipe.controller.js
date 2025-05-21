import cloudinary from "../lib/cloudinary.js";
import Ingredient from "../models/ingredient.models.js";
import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";
import { calculateRecipeCost } from "../services /recipeCalculator.service.js";

//logic of creating a recipe
export const createRecipe = async (req, res) => {
    try {
        const userId = req.user._id;
        const imageUrl = "";

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
            return res.status(400).json({ message: "Missing fields" });
        }

        // Search for all the necessary ingredients
        const materialIds = ingredients.map(i => i.materialId);
        
        // Checks if the id of the ingredients are real or valid
        const allValid = materialIds.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) {
             return res.status(400).json({ message: "Ingredient does not exists or not authorized" });
        }
        
        // Checks if the ingredient unity is real or grater than 0
        const invalidIngredient = ingredients.find(ing => {
            return !ing.units || Number(ing.units) <= 0;
        });

        if (invalidIngredient) {
            return res.status(400).json({ message: "Invalid Quantity or unauthorized"});
        }

        // Checks for the id within the object 
        const dbMaterials = await Ingredient.find({ _id: { $in: materialIds } });

        // Checks if the material does not exists
        if (!dbMaterials || dbMaterials.length !== materialIds.length) {
            return res.status(400).json({ message: "One or more ingredients do not exist or not authorized" });
        }

        // Calculate costs
        const costData = calculateRecipeCost({
            ingredientsData: dbMaterials,
            recipeIngredients: ingredients,
            additionalCostPercentage: aditionalCostpercentages,
            profitPercentage,
            portions: portionsPerrecipe
        });
        
        // if there is image it uploads it
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: 'recipes',
                    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
                    max_file_size: 5 * 1024 * 1024,
                    invalidate: true
                });

                imageUrl = uploadResponse.secure_url;
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
            image: imageUrl
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
              image: newRecipe.image
            });
        }else{
            res.status(400).json({ message: "Invalid Recipe data" });
        }
    } catch (error) {
        
        // Handles errors from services and server errors
        if (error.message.startsWith("it is not possible to convert Volume, Weight and pieces:")) {
            return res.status(400).json({ message: error.message });
        }
        
        if (error.message.startsWith("Material with ID")) {
            return res.status(400).json({ message: error.message });
        }
       
        if (error.message.startsWith("Unity Unknown")) {
            return res.status(400).json({ message: error.message });
        }

        console.error("Error in createRecipe controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

//Get Recipes of an loged in user Logic
export const getRecipes = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRecipes = await Recipe.find({userId: userId}).select("-userId");

        return res.status(200).json(userRecipes);
    } catch (error) {
        console.log("Error in recipe controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

//Logic for deleting ingredients
export const deleteIngredient = async (req, res) => {
    try {
        if(!req.params){
            return res.status(404).json({ message: "Not Found" });
        }
        const {id:ingredientId} = req.params;
        const userId = req.user._id;
        
        //checks if id is in the correct structure
        if (!mongoose.Types.ObjectId.isValid(ingredientId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        // Checks if the ingredient exists AND belongs to the user
        const ingredient = await Ingredient.findOne({ 
            _id: ingredientId, 
            userId: userId 
        });

        if (!ingredient) {
            return res.status(404).json({ 
                message: "Ingredient not found or unauthorized" 
            });
        }

        await Ingredient.deleteOne({ _id: ingredientId });

        return res.status(200).json({ message: "Ingredient deleted Succesfully" });

    } catch (error) {
        console.error("Error in deleteIngredient:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

//Logic for updating ingredients using filter
export const updateIngredient = async (req, res) => {
    try {
        const { id:ingredientId } = req.params;
        const userId = req.user._id;
        const { filteredUpdates } = req; // Already validated/filtered by middleware
    
        //in here is not neccesary to check if there's no data coming from the user because
        //the middleware does that

        const ingredient = await Ingredient.findOne({ _id: ingredientId, userId: userId });
        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found or unauthorized" });
        }

        //checks if the user updates to a name occupied
        const SameName = await Ingredient.findOne({ name: filteredUpdates.name, userId: userId });
        if (SameName) {
            return res.status(409).json({ message: "Ingredient already exists" });
        }
        
        //logic for restricting the unit price and updating it
        if(!filteredUpdates.totalPrice){
            filteredUpdates.totalPrice = ingredient.totalPrice
        }

        if(!filteredUpdates.Units){
            filteredUpdates.Units = ingredient.Units
        }

        filteredUpdates.unityPrice = filteredUpdates.totalPrice / filteredUpdates.Units;

        //Apply updates (fields are pre-filtered)
        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            ingredientId,
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        );        
    
        res.status(200).json(updatedIngredient);
    } catch (error) {
        // Handle validation errors (e.g., "quantity must be a number")
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed" });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
  };