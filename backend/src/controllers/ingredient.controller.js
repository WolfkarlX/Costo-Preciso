import cloudinary from "../lib/cloudinary.js";
import Ingredient from "../models/ingredient.models.js";
import mongoose from "mongoose";

//logic of creating an ingredient
export const createIngredient = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: "Request is empty" });
    }

    //gets id from middleware auth
    const userId = req.user._id
    const { name, pricePerunit, unitOfmeasurement} = req.body;
    try {
        if(!name || !pricePerunit || !unitOfmeasurement) {
            return res.status(400).json({ message: "All fields are required"});
        }
        
        const newIngredient = await new Ingredient({
            name,
            pricePerunit,
            unitOfmeasurement,
            userId
        });

        if(newIngredient) {
            //save the ingredient in the DB
            await newIngredient.save();

            //returns a JSON object of the model created and saved in the DB
            res.status(201).json({
                _id: newIngredient._id,
                name: newIngredient.name,
                pricePerunit: newIngredient.pricePerunit,
                unitOfmeasurement: newIngredient.unitOfmeasurement,
                userId: newIngredient.userId
            });
        } else {
            res.status(400).json({ message: "Invalid Ingredient data" });
        }
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
        console.log("Error in login controller", error.message);
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

      const ingredient = await Ingredient.findOne({ _id: ingredientId, userId });
      if (!ingredient) {
        return res.status(404).json({ message: "Ingredient not found or unauthorized" });
      }
  
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