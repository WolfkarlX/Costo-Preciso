import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useRecipeStore } from "../store/useRecipeStore";
import { toast } from "react-hot-toast";
import AddRecipe from "./AddRecipe"; // Asegúrate de tener este import
import EditRecipe from "./EditRecipe";
import ManageMaterials from "./ManageMaterials";

const HomePage = () => {
  const { authUser } = useAuthStore();
  const {
    recipes,
    materials, // Usamos materiales en lugar de ingredientes
    isLoading,
    fetchRecipes,
    fetchMaterials,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  } = useRecipeStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageMaterialsModal, setShowManageMaterialsModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  useEffect(() => {
    if (authUser) {
      fetchRecipes();
      fetchMaterials();
    }
  }, [authUser, fetchRecipes, fetchMaterials]);

  const getMaterialName = (materialId) => {
    const material = materials.find((m) => m._id === materialId);
    return material ? material.name : "Material desconocido";
  };

  const getMaterialPrice = (materialId) => {
    const material = materials.find((m) => m._id === materialId);
    return material ? material.price : 0;
  };

  const handleEditClick = (recipeId) => {
    const recipeToEdit = recipes.find((recipe) => recipe._id === recipeId);
    setCurrentRecipe(recipeToEdit);
    setShowEditModal(true);
  };

  const handleUpdateRecipe = (updatedData) => {
    updateRecipe(currentRecipe._id, updatedData, () => {
      setShowEditModal(false);
      fetchRecipes();
    });
  };

  const handleDeleteRecipe = (id) => {
    deleteRecipe(id);
  };

  const toggleAccordion = (recipeId) => {
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

  return (
    <div>
      <nav className="bg-blue-600 p-4 text-white">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-xl">Mi Recetario</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-24 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Tus Recetas</h2>

        <button
          onClick={() => setShowManageMaterialsModal(true)}
          className="btn btn-primary mb-4"
        >
          Gestionar Materiales
        </button>

        {recipes.length === 0 ? (
          <p className="text-center">No hay recetas registradas aún.</p>
        ) : (
          <div className="grid gap-4">
            {recipes.map((recipe) => (
              <div key={recipe._id} className="p-4 border rounded shadow bg-base-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{recipe.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(recipe._id)}
                      className="btn btn-xs btn-outline btn-info"
                      title="Editar receta"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe._id)}
                      className="btn btn-xs btn-outline btn-error"
                      title="Eliminar receta"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
                <p>
                  <strong>Materiales:</strong>{" "}
                  {Array.isArray(recipe.materials) && recipe.materials.length > 0
                    ? recipe.materials.map((id, index) => {
                        const materialName = getMaterialName(id);
                        return (
                          <span key={`${id}-${index}`}>{materialName}, </span>
                        );
                      })
                    : "N/A"}
                </p>
                <button
                  onClick={() => toggleAccordion(recipe._id)}
                  className="btn btn-xs btn-outline btn-primary mt-2"
                >
                  {expandedRecipe === recipe._id ? "Ocultar Materiales" : "Ver Materiales"}
                </button>

                {expandedRecipe === recipe._id && (
                  <div className="mt-2">
                    <strong>Materiales Utilizados:</strong>
                    <ul>
                      {Array.isArray(recipe.materials) && recipe.materials.length > 0 ? (
                        recipe.materials.map((id, index) => {
                          const materialName = getMaterialName(id);
                          const materialPrice = getMaterialPrice(id);
                          return (
                            <li key={`${id}-${index}`}>  {/* Usamos una clave única */}
                              {materialName}: ${materialPrice}
                            </li>
                          );
                        })
                      ) : (
                        <li>No hay materiales disponibles</li>
                      )}
                    </ul>
                    <p>
                      <strong>Costo Total de Ingredientes:</strong> $
                      {Array.isArray(recipe.materials)
                        ? recipe.materials.reduce(
                            (total, id) => total + getMaterialPrice(id),
                            0
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                )}

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

        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 bg-primary text-white w-14 h-14 rounded-full text-3xl flex items-center justify-center shadow-lg hover:bg-primary/80 transition"
        >
          +
        </button>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-xl relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
              <AddRecipe
                onSuccess={() => {
                  setShowAddModal(false);
                  fetchRecipes();
                }}
              />
            </div>
          </div>
        )}

        {showEditModal && currentRecipe && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-xl relative">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
              <EditRecipe
                formData={currentRecipe}
                onSuccess={handleUpdateRecipe}
                ingredients={materials}
              />
            </div>
          </div>
        )}

        {showManageMaterialsModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <ManageMaterials onClose={() => setShowManageMaterialsModal(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
