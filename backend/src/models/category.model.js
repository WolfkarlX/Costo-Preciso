import mongoose, { SchemaTypes, Types } from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        recipes: [
                    {
                        recipeId: {
                            type: SchemaTypes.ObjectId,
                            ref: "recipe",  // Reference to Recipe model
                        }
                    }
                ],
    },
    { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;