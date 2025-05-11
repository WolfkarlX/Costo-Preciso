import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        materials: [
            {
                materialId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Material",  // Referencia al modelo Material
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                unit: {
                    type: String,
                    enum: ['kg', 'litros', 'mililitros', 'gramos', 'unidades'],  // Asegúrate de que la unidad sea una de estas
                    required: true,
                },
            },
        ],
        cost: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
