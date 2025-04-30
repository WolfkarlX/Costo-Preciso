import React, { useState } from "react";
import { useRecipeStore } from "../store/useRecipeStore";

const AddRecipe = () => {
  const [form, setForm] = useState({
    title: "",
    ingredients: "",
    steps: "",
    cost: ""
  });

  const { createRecipe, isCreating } = useRecipeStore();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      title: form.title,
      ingredients: form.ingredients.split(",").map(i => i.trim()),
      steps: form.steps.split(",").map(s => s.trim()),
      cost: parseFloat(form.cost)
    };

    createRecipe(data, () => {
      setForm({ title: "", ingredients: "", steps: "", cost: "" });
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
        <input
          name="ingredients"
          placeholder="Ingredientes (separados por comas)"
          value={form.ingredients}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
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
