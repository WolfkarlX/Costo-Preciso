import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const EditRecipe = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        ingredients: "",
        steps: "",
        cost: ""
    });

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const { data } = await axios.get("http://localhost:5001/api/recipes");
                const recipe = data.find(r => r._id === id);

                if (!recipe) {
                    toast.error("Receta no encontrada");
                    return;
                }

                setFormData({
                    title: recipe.title,
                    ingredients: recipe.ingredients.join(", "),
                    steps: recipe.steps.join(", "),
                    cost: recipe.cost.toString(),
                });
            } catch (error) {
                console.error("Error al cargar receta:", error);
                toast.error("No se pudo cargar la receta");
            }
        };

        fetchRecipe();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { title, ingredients, steps, cost } = formData;

        if (!title.trim() || !ingredients.trim() || !steps.trim() || !cost.trim()) {
            return toast.error("Todos los campos son obligatorios");
        }

        const updatedRecipe = {
            title: title.trim(),
            ingredients: ingredients.split(",").map(i => i.trim()),
            steps: steps.split(",").map(s => s.trim()),
            cost: parseFloat(cost),
        };

        try {
            await axios.put(`http://localhost:5001/api/recipes/${id}`, updatedRecipe, {
                withCredentials: true,
            });

            toast.success("Receta actualizada correctamente");
            navigate("/recipes");
        } catch (error) {
            console.error("Error al actualizar receta:", error);
            toast.error("No se pudo actualizar la receta");
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-24 px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Editar Receta</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Título"
                    className="input input-bordered"
                    required
                />
                <input
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    placeholder="Ingredientes (separados por coma)"
                    className="input input-bordered"
                    required
                />
                <input
                    name="steps"
                    value={formData.steps}
                    onChange={handleChange}
                    placeholder="Pasos (separados por coma)"
                    className="input input-bordered"
                    required
                />
                <input
                    name="cost"
                    type="number"
                    value={formData.cost}
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
