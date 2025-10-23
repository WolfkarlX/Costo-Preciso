import cloudinary from "../lib/cloudinary.js";
import Ingredient from "../models/ingredient.models.js";
import Recipe from "../models/recipe.model.js"
import mongoose from "mongoose";

//logic of creating an ingredient
export const createIngredient = async (req, res) => {
    if (!req.body) return res.status(400).json({ message: "La solicitud está vacía" });

    //gets id from middleware auth
    const userId = req.user._id;
    let imageUrl = "";
    let publicId = "";

    const { name, Units, unityOfmeasurement, totalPrice, image } = req.body;

    try {
        if(!name || !Units || !unityOfmeasurement || !totalPrice) {
            return res.status(400).json({ message: "Todos los campos son obligatorios"});
        }
        
        //Gets the unitPrice for this material or ingredient
        const unityPrice = parseFloat(totalPrice) / parseFloat(Units);

        // Subida de imagen
        if(image){
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                  folder: 'ingredients',
                  allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'], // Reject non-images
                  max_file_size: 5 * 1024 * 1024, // 5MB limit (in bytes)
                  invalidate: true // Force Cloudinary to revalidate
                });
                
                imageUrl = uploadResponse.secure_url;
                publicId = uploadResponse.public_id;
            } catch (error) {
                console.error('Cloudinary upload error:', error.message);
                return res.status(400).json({ message: 'Imagen inválida. Debe ser JPG/PNG/JPEG/GIF/WEBP y pesar menos de 5 MB'});
            }
        }
        //checks if there is an ingredient with the same name
        const ingredient = await Ingredient.findOne({ name, userId });
      
        if(ingredient){
            return res.status(409).json({ 
                message: "El ingrediente ya existe" 
            });
        }
        
        const newIngredient = await new Ingredient({
            name, 
            Units, 
            unityOfmeasurement, 
            totalPrice, 
            unityPrice, 
            userId,
            imageUrl,
            publicId
        });

        if(newIngredient) {
            //save the ingredient in the DB
            await newIngredient.save();
            
            //returns a JSON object of the model created and saved in the DB
            res.status(201).json({
                _id: newIngredient._id,
                name: newIngredient.name,
                Units: newIngredient.Units, 
                unityOfmeasurement: newIngredient.unityOfmeasurement, 
                totalPrice: newIngredient.totalPrice, 
                unityPrice: newIngredient.unityPrice, 
                imageUrl: newIngredient.image,
                publicId: newIngredient.publicId
            });
         } else {
            res.status(400).json({ message: "Datos de ingrediente inválidos" });
        }
    } catch (error) {
        console.error("Error in createIngredient controller", error.message);
        res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

//Get Ingredients of an loged in user Logic
export const getIngredients = async (req, res) => {
    try {
        const userId = req.user._id;

        const userIngredients = await Ingredient.find({userId: userId}).select("-userId");      
          
        return res.status(200).json(userIngredients);
    } catch (error) {
        console.error("Error in getIngredients controller", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

//Get Just one Ingredient logic
export const getSpecificingredient = async (req, res) => {
    try {
        if(!req.params){
            return res.status(404).json({ message: "No encontrado" });
        }

        const userId = req.user._id;
        const {id:ingredientId} = req.params;

        if (!mongoose.Types.ObjectId.isValid(ingredientId)) {
            return res.status(400).json({ message: "ID no válida" });
        }

        const userIngredient = await Ingredient.findOne({userId: userId, _id: ingredientId}).select("-userId");
        
        if (!userIngredient) {
            return res.status(404).json({ 
                message: "Ingrediente no encontrado o no autorizado" 
            });
        }

        return res.status(200).json(userIngredient);

    } catch (error) {
        console.log("Error in getSpecificingredient Controller", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

//Logic for deleting ingredients
export const deleteIngredient = async (req, res) => {
    try {
        if(!req.params){
            return res.status(404).json({ message: "No encontrado" });
        }
        const {id:ingredientId} = req.params;
        const userId = req.user._id;
        
        //checks if id is in the correct structure
        if (!mongoose.Types.ObjectId.isValid(ingredientId)) {
            return res.status(400).json({ message: "ID no válida" });
        }

        // Checks if the ingredient exists AND belongs to the user
        const ingredient = await Ingredient.findOne({ 
            _id: ingredientId, 
            userId: userId 
        });

        if (!ingredient) {
            return res.status(404).json({ 
                message: "Ingrediente no encontrado o no autorizado"
            });
        }

        const withinRecipe = await Recipe.findOne({
            "ingredients.materialId": ingredientId,
            userId: userId
        }); 
        
        if (withinRecipe) {
            return res.status(400).json({ message: "Existe una receta que requiere este material" });
        }
          
        await Ingredient.deleteOne({ _id: ingredientId });

        return res.status(200).json({ message: "Ingrediente eliminado Exitosamente" });

    } catch (error) {
        console.error("Error in deleteIngredient Controller:", error.message);
        return res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};

//Logic for updating ingredients using filter
export const updateIngredient = async (req, res) => {
    try {
        const { id: ingredientId } = req.params;
        const userId = req.user._id;
        let { filteredUpdates } = req; // vienen los updates validados por middleware
        const { image } = req.body;

        const ingredient = await Ingredient.findOne({ _id: ingredientId, userId: userId });
        if (!ingredient) {
            return res.status(404).json({ message: "Ingrediente no encontrado o no autorizado" });
        }

        // Manejo de imagen
        if (image === null || image === "") {
            // Eliminar imagen existente si había
            if (ingredient.publicId) {
                await cloudinary.uploader.destroy(ingredient.publicId);
            }
            filteredUpdates.imageUrl = "";
            filteredUpdates.publicId = "";
        } else if (image && image.startsWith("data:image")) {
            // Subir nueva imagen
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: "ingredients",
                    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
                    max_file_size: 5 * 1024 * 1024, // 5MB
                    invalidate: true,
                });

                // Si había imagen previa, eliminarla
                if (ingredient.publicId) {
                    await cloudinary.uploader.destroy(ingredient.publicId);
                }

                filteredUpdates.imageUrl = uploadResponse.secure_url;
                filteredUpdates.publicId = uploadResponse.public_id;
            } catch (error) {
                console.error("Cloudinary upload error:", error.message);
                return res.status(400).json({
                    message: "Imagen inválida. Debe ser JPG/PNG/JPEG/GIF/WEBP y pesar menos de 5 MB",
                });
            }
        }

        //checks if the user updates to a name occupied
        if (filteredUpdates.name) {
            const SameName = await Ingredient.findOne({
                name: filteredUpdates.name,
                userId: userId,
                _id: { $ne: ingredientId } // excluye el actual ingrediente
            });
            if (SameName) {
                return res.status(409).json({ message: "El ingrediente ya existe" });
            }
        }
      
        //logic for restricting the unit price and updating it
        if(!filteredUpdates.totalPrice){
            filteredUpdates.totalPrice = ingredient.totalPrice
        }

        if(!filteredUpdates.Units){
            filteredUpdates.Units = ingredient.Units
        }

        filteredUpdates.unityPrice = filteredUpdates.totalPrice / filteredUpdates.Units;
        
        // Revisar
        const totalPrice = filteredUpdates.totalPrice ?? ingredient.totalPrice;
        const Units = filteredUpdates.Units ?? ingredient.Units;
        filteredUpdates.unityPrice = totalPrice / Units;
    
        //Apply updates (fields are pre-filtered)
        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            ingredientId,
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedIngredient);
    } catch (error) {
        
        console.error("Error in updateIngredient Controller:", error.message);
        // Handle validation errors (e.g., "quantity must be a number")
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "La validación falló" });
        }
        res.status(500).json({ message: "No es posible realizar la acción, Inténtelo más tarde" });
    }
};
