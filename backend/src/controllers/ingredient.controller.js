import cloudinary from "../lib/cloudinary.js";
import Ingredient from "../models/ingredient.models.js";
import Recipe from "../models/recipe.model.js"
import mongoose from "mongoose";

//logic of creating an ingredient
export const createIngredient = async (req, res) => {
    if (!req.body) return res.status(400).json({ message: "Request is empty" });

    const userId = req.user._id;
    let imageUrl = "";
    let publicId = "";

    const { name, Units, unityOfmeasurement, totalPrice, image } = req.body;

    try {
        if(!name || !Units || !unityOfmeasurement || !totalPrice) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const unityPrice = parseFloat(totalPrice) / parseFloat(Units);

        // Subida de imagen
        if(image){
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                  folder: 'ingredients',
                  allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
                  max_file_size: 5 * 1024 * 1024,
                  invalidate: true
                });
                
                imageUrl = uploadResponse.secure_url;
                publicId = uploadResponse.public_id;
            } catch (error) {
                console.error('Cloudinary upload error:', error.message);
                return res.status(400).json({ message: 'Invalid image. Must be JPG/PNG/GIF under 5MB.' });
            }
        }

        const ingredientExist = await Ingredient.findOne({ name, userId });
        if(ingredientExist) return res.status(409).json({ message: "Ingredient already exists" });

        const newIngredient = new Ingredient({
            name, 
            Units, 
            unityOfmeasurement, 
            totalPrice, 
            unityPrice, 
            userId,
            imageUrl,
            publicId
        });

        await newIngredient.save();

        res.status(201).json(newIngredient);

    } catch (error) {
        console.log("Error in createIngredient controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

//Get Ingredients of an loged in user Logic
export const getIngredients = async (req, res) => {
    try {
        const userId = req.user._id;

        const userIngredients = await Ingredient.find({userId: userId}).select("-userId");      
          
        return res.status(200).json(userIngredients);
    } catch (error) {
        console.log("Error in getIngredients controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

//Get Just one Ingredient logic
export const getSpecificingredient = async (req, res) => {
    try {
        if(!req.params){
            return res.status(404).json({ message: "Not Found" });
        }

        const userId = req.user._id;
        const {id:ingredientId} = req.params;

        if (!mongoose.Types.ObjectId.isValid(ingredientId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const userIngredient = await Ingredient.findOne({userId: userId, _id: ingredientId}).select("-userId");
        
        if (!userIngredient) {
            return res.status(404).json({ 
                message: "Ingredient not found or unauthorized" 
            });
        }

        return res.status(200).json(userIngredient);

    } catch (error) {
        console.log("Error in getSpecificingredient Controller", error.message);
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

        const withinRecipe = await Recipe.findOne({
            "ingredients.materialId": ingredientId,
            userId: userId
        }); 
        
        if (withinRecipe) {
            return res.status(400).json({ message: "There is a recipe requiring this material" });
        }
          
        await Ingredient.deleteOne({ _id: ingredientId });

        return res.status(200).json({ message: "Ingredient deleted Succesfully" });

    } catch (error) {
        console.error("Error in deleteIngredient Controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateIngredient = async (req, res) => {
    try {
        const { id: ingredientId } = req.params;
        const userId = req.user._id;
        let { filteredUpdates } = req; // vienen los updates validados por middleware
        const { image } = req.body;

        const ingredient = await Ingredient.findOne({ _id: ingredientId, userId: userId });
        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient not found or unauthorized" });
        }

        // 🔹 Verificar si se quiere cambiar la imagen
        if (image && image.startsWith("data:image")) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: "ingredients",
                    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
                    max_file_size: 5 * 1024 * 1024, // 5MB
                    invalidate: true,
                });
                filteredUpdates.imageUrl = uploadResponse.secure_url;
            } catch (error) {
                console.error("Cloudinary upload error:", error.message);
                return res.status(400).json({
                    message: "Invalid image. Must be JPG/PNG/GIF under 5MB.",
                });
            }
        }

        // 🔹 Evitar duplicado de nombre
        if (filteredUpdates.name) {
            const SameName = await Ingredient.findOne({
                name: filteredUpdates.name,
                userId: userId,
                _id: { $ne: ingredientId }
            });
            if (SameName) {
                return res.status(409).json({ message: "Ingredient already exists" });
            }
        }

        // 🔹 Recalcular precio unitario
        const totalPrice = filteredUpdates.totalPrice ?? ingredient.totalPrice;
        const Units = filteredUpdates.Units ?? ingredient.Units;
        filteredUpdates.unityPrice = totalPrice / Units;

        // 🔹 Actualizar
        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            ingredientId,
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        );

        return res.status(200).json(updatedIngredient);
    } catch (error) {
        console.error("Error in updateIngredient Controller:", error.message);
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Validation failed" });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};
