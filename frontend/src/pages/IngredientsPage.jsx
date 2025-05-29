import { useState } from "react";
import { Plus, Trash, Egg } from "lucide-react"; // íconos
import "../styles/IngredientsPage.css";

const IngredientsPage = () => {
    const [ingredients, setIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleAddIngredient = () => {
        if (newIngredient) {
            setIngredients([...ingredients, newIngredient]);
            setNewIngredient("");
        }
    };

    const handleRemoveIngredient = (index) => {
        const updatedIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(updatedIngredients);
    };

    return (
        <div className="bg-white w-full h-screen">
            {/* Imagen de fondo */}
            <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: "url('/src/img/wallpaper_ingredients.png')" }}>
                <div className="absolute inset-0 bg-black opacity-20"></div>
            </div>

            {/* Contenedor principal */}
            <div className="flex justify-center items-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">

                    {/* Barra de búsqueda */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            className="input w-full p-4 pl-12 border-2 rounded-xl shadow-lg"
                            placeholder="Buscar ingrediente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">🔍</span>
                    </div>

                    {/* Lista de ingredientes */}
                    <div className="space-y-4" class="list-ingred">
                        {ingredients.length > 0 ? (
                            ingredients
                                .filter((ingredient) => ingredient.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((ingredient, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
                                        <div className="flex items-center space-x-3  text-black">
                                            <Egg size={24} color="black" />
                                            <span>{ingredient}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={() => handleRemoveIngredient(index)}
                                        >
                                            <Trash className="text-white" />
                                        </button>
                                    </div>
                                ))
                        ) : (
                            <div className="text-center text-gray-500">
                                No hay ingredientes agregados
                            </div>
                        )}
                    </div>

                    {/* Botón de agregar ingrediente */}
                    <div className="relative">
                        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl shadow-md">
                            <input
                                type="text"
                                className="input w-full p-4 border-2 rounded-xl"
                                placeholder="Nombre del ingrediente"
                                value={newIngredient}
                                onChange={(e) => setNewIngredient(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={handleAddIngredient}
                            >
                                <Plus className="text-primary" />
                            </button>
                        </div>
                    </div>

                    {/* Botón de guardar */}
                    <div className="text-center mt-6">
                        <button className="btn btn-primary w-full font-bold mt-6 rounded-xl py-4">Guardar Ingredientes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IngredientsPage;
