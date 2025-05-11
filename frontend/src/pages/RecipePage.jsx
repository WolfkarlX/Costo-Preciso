import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import AddRecipe from "./AddRecipe"; // Asegúrate de tener este import

const RecipesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [ingredients, setIngredients] = useState([]); // Guardamos los ingredientes disponibles

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

    const fetchIngredients = async () => {
        try {
            const response = await axios.get("http://localhost:5001/api/ingredients", {
                withCredentials: true,
            });
            setIngredients(response.data); // Guardamos los ingredientes disponibles
        } catch (error) {
            console.error("Error al obtener ingredientes:", error);
        }
    };

    useEffect(() => {
        fetchRecipes();
        fetchIngredients(); // Llamamos a la API de ingredientes
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

    const getIngredientDetails = (ingredientId) => {
        const ingredient = ingredients.find((i) => i._id === ingredientId);
        return ingredient ? { name: ingredient.name, price: ingredient.price } : { name: "Ingrediente desconocido", price: 0 };
    };

    // Calcular el costo total de los ingredientes
    const calculateTotalCost = (ingredientIds) => {
        return ingredientIds.reduce((total, id) => {
            const ingredient = getIngredientDetails(id);
            return total + ingredient.price;
        }, 0);
    };

    return (
        <div className="max-w-4xl mx-auto mt-24 px-4 relative">
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
                                {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
                                    ? recipe.ingredients.map((id) => {
                                          const { name, price } = getIngredientDetails(id);
                                          return (
                                              <span key={id}>
                                                  {name} (${price}),{" "}
                                              </span>
                                          );
                                      })
                                    : "N/A"}
                            </p>
                            <p>
                                <strong>Costo Total de Ingredientes:</strong> $
                                {Array.isArray(recipe.ingredients) ? calculateTotalCost(recipe.ingredients).toFixed(2) : "0.00"}
                            </p>
                            <p>
                                <strong>Pasos:</strong>{" "}
                                {Array.isArray(recipe.steps) ? recipe.steps.join(", ") : "N/A"}
                            </p>
                            <p>
                                <strong>Costo:</strong> ${recipe.cost}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Botón flotante para agregar receta */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-8 right-8 bg-primary text-white w-14 h-14 rounded-full text-3xl flex items-center justify-center shadow-lg hover:bg-primary/80 transition"
            >
                +
            </button>

            {/* Modal con el formulario */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-xl relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-gray-700"
                        >
                            &times;
                        </button>
                        <AddRecipe
                            onSuccess={() => {
                                setShowModal(false);
                                fetchRecipes(); // recarga recetas
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipesPage;
