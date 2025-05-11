import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRecipeStore } from "../store/useRecipeStore"; // Importamos la lógica del store para actualizar la receta

const EditRecipe = ({ formData, onSuccess, ingredients }) => {
    const { updateRecipe } = useRecipeStore(); // Usamos la función updateRecipe del store

    // Convertir los ingredientes (IDs) a sus nombres
    const ingredientNames = formData.ingredients.map(
        (ingredientId) => ingredients.find((i) => i._id === ingredientId)?.name || ""
    );

    const [form, setForm] = useState({
        title: formData.title || "",
        ingredients: ingredientNames.join(", ") || "",
        steps: formData.steps.join(", ") || "",
        cost: formData.cost || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { title, ingredients, steps, cost } = form;

        // Validación de los campos
        if (!title.trim() || !ingredients.trim() || !steps.trim() || !cost.trim()) {
            return toast.error("Todos los campos son obligatorios");
        }

        // Convertir los nombres de ingredientes de vuelta a sus IDs
        const updatedIngredients = ingredients.split(",").map((i) => i.trim()).map(
            (name) => ingredients.find((ingredient) => ingredient.name === name)?._id
        );

        const updatedRecipe = {
            title: title.trim(),
            ingredients: updatedIngredients,
            steps: steps.split(",").map((s) => s.trim()),
            cost: parseFloat(cost),
        };

        try {
            // Llamamos a la función updateRecipe desde el store
            await updateRecipe(formData._id, updatedRecipe, onSuccess);
        } catch (error) {
            console.error("Error al actualizar receta:", error);
            toast.error("No se pudo actualizar la receta");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Editar Receta</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Título"
                    className="input input-bordered"
                    required
                />
                <input
                    name="ingredients"
                    value={form.ingredients}
                    onChange={handleChange}
                    placeholder="Ingredientes (separados por coma)"
                    className="input input-bordered"
                    required
                />
                <input
                    name="steps"
                    value={form.steps}
                    onChange={handleChange}
                    placeholder="Pasos (separados por coma)"
                    className="input input-bordered"
                    required
                />
                <input
                    name="cost"
                    type="number"
                    value={form.cost}
                    onChange={handleChange}
                    placeholder="Costo"
                    className="input input-bordered"
                    step="0.01"
                    min="0"
                    required
                />
                <button type="submit" className="btn btn-primary">
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
};

export default EditRecipe;
