import mongoose, { SchemaTypes, Types } from "mongoose";

const recipeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        totalCost: {
            type: String,
            required: true,
        },
        profitPercentage: {
            type: String,
            required: true,
        },
        netProfit: {
            type: String,
            required: true,
        },
        aditionalCostpercentages: {
            type: String,
            required: true,
        },
        costPerunity: {
            type: String,
            required: true,
        },
        portionsPerrecipe: {
            type: String,
            required: true,
        },
        quantityPermeasure: {
            type: String,
            required: true,
        },
        recipeunitOfmeasure: {
            type: String,
            required: true,
        },
        ingredients: [
            {
                materialId: {
                    type: SchemaTypes.ObjectId,
                    ref: "materials",  // Reference to your Material model
                    required: true
                },
                units:{
                    type: String,
                    required: true,
                },
                UnitOfmeasure: {
                    type: String,
                    required: true,
                }
            }
        ],
        favorite: {
            type: Boolean,
            default: false,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        additionalCost: {
            type: String,
            default: ""
        },
        materialCostTotal: {
            type: String,
            default: ""
        },
        grossProfit: {
            type: String,
            default: ""
        },
        unitSalePrice: {
            type: String,
            default: ""
        },
        imageUrl: {
            type: String,
            default: ""
        },
        publicId: { type: String }
    },
    { timestamps: true }
);

const Recipe = mongoose.model("recipe", recipeSchema);

export default Recipe;