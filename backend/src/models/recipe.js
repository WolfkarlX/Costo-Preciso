import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        ingredients: {
            type: [String],
            required: true,
        },
        steps: {
            type: [String],
            required: true,
        },
        cost: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
