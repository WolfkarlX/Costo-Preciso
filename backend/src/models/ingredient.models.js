import mongoose, { SchemaTypes, Types } from "mongoose";

const ingredientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        Units: {
            type: String,
            required: true,
        },
        unityOfmeasurement: {
            type: String,
            required: true,
        },
        totalPrice: {
            type: String,
            required: true,
        },
        unityPrice: {
            type: String,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        imageUrl: {
            type: String,
            default: ""
        },
    },
    { timestamps: true }
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;