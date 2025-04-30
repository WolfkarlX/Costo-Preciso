import mongoose, { SchemaTypes, Types } from "mongoose";

const ingredientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        pricePerunit: {
            type: String,
            required: true,
        },
        unitOfmeasurement: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        image: {
            type: String,
            default: ""
        },
    },
    { timestamps: true }
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;