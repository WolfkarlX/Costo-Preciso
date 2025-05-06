import React, { useEffect, useState } from "react";
import { useRecipeStore } from "../store/useRecipeStore";

const AddRecipe = () => {
  const [form, setForm] = useState({
    title: "",
    selectedIngredients: [],
    steps: "",
    cost: ""
  });

  const { createRecipe, isCreating, getIngredients, ingredients } = useRecipeStore();

  useEffect(() => {
    getIngredients();
  }, [getIngredients]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIngredientSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId && !form.selectedIngredients.includes(selectedId)) {
      setForm({
        ...form,
        selectedIngredients: [...form.selectedIngredients, selectedId],
      });
    }
  };

  const handleRemoveIngredient = (id) => {
    setForm({
      ...form,
      selectedIngredients: form.selectedIngredients.filter((ing) => ing !== id),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      title: form.title,
      ingredients: form.selectedIngredients,
      steps: form.steps.split(",").map((s) => s.trim()),
      cost: parseFloat(form.cost)
    };

    createRecipe(data, () => {
      setForm({ title: "", selectedIngredients: [], steps: "", cost: "" });
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-24 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Agregar Receta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Título"
          value={form.title}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        <label className="block text-sm font-medium">Ingredientes</label>
        <select
          value=""
          onChange={handleIngredientSelect}
          className="select select-bordered w-full"
        >
          <option disabled value="">-- Selecciona un ingrediente --</option>
          {ingredients.map((ingredient) => (
            <option key={ingredient._id} value={ingredient._id}>
              {ingredient.name}
            </option>
          ))}
        </select>

        {form.selectedIngredients.length > 0 && (
          <div className="text-sm mt-2">
            <strong>Seleccionados:</strong>{" "}
            {form.selectedIngredients.map((id) => {
              const ing = ingredients.find((i) => i._id === id);
              return (
                <span key={id} className="inline-block bg-base-200 px-2 py-1 rounded mr-2 mt-1">
                  {ing?.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(id)}
                    className="ml-1 text-red-500"
                    title="Eliminar ingrediente"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <input
          name="steps"
          placeholder="Pasos (separados por comas)"
          value={form.steps}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
        <input
          name="cost"
          type="number"
          placeholder="Costo"
          value={form.cost}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary w-full" disabled={isCreating}>
          {isCreating ? "Guardando..." : "Agregar Receta"}
        </button>
      </form>
    </div>
  );
};

export default AddRecipe;
