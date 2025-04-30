import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const RecipesPage = () => {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/recipes/all", {

                    withCredentials: true,
                });
                setRecipes(response.data);
            } catch (error) {
                console.error("Error al obtener recetas:", error);
                toast.error("No se pudieron cargar las recetas");
            }
        };

        fetchRecipes();
    }, []);

    const handleDelete = async (id) => {
        const confirm = window.confirm("¿Estás seguro de que deseas eliminar esta receta?");
        if (!confirm) return;

        try {
            await axios.delete(`http://localhost:5001/api/recipes/${id}`, {
                withCredentials: true,
            });

            setRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
            toast.success("Receta eliminada correctamente");
        } catch (error) {
            console.error("Error al eliminar receta:", error);
            toast.error("No se pudo eliminar la receta");
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-24 px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Lista de Recetas</h2>

            {recipes.length === 0 ? (
                <p className="text-center">No hay recetas registradas aún.</p>
            ) : (
                <div className="grid gap-4">
                    {recipes.map((recipe) => (
                        <div key={recipe._id} className="p-4 border rounded shadow bg-base-100">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">{recipe.title}</h3>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/recipes/edit/${recipe._id}`}
                                        className="btn btn-xs btn-outline btn-info"
                                        title="Editar receta"
                                    >
                                        ✏️ Editar
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(recipe._id)}
                                        className="btn btn-xs btn-outline btn-error"
                                        title="Eliminar receta"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                            <p>
                                <strong>Ingredientes:</strong>{" "}
                                {Array.isArray(recipe.ingredients)
                                    ? recipe.ingredients.join(", ")
                                    : "N/A"}
                            </p>
                            <p>
                                <strong>Pasos:</strong>{" "}
                                {Array.isArray(recipe.steps)
                                    ? recipe.steps.join(", ")
                                    : "N/A"}
                            </p>
                            <p>
                                <strong>Costo:</strong> ${recipe.cost}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipesPage;
