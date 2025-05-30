import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

export const useRecipesStore = create((set, get) => ({
    ingredients: [],
    recipes: [],
    isCreating: false,
    isGetting: false,

    fetchIngredients: async () => {
        set({ isGetting: true });
        try {
            const res = await axiosInstance.get("http://localhost:5001/api/ingredient/ingredients");
            set({ ingredients: res.data }); // Guarda la lista en el estado
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al obtener ingredientes.");
        } finally {
            set({ isGetting: false });
        }
    },

    create: async (data) => {
        set({ isCreating: true });
        try {
            const res = await axiosInstance.post("http://localhost:5001/api/recipe/create", data);
            toast.success("Recipe Added");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isCreating: false });
        }
    },

    fetchRecipes: async () => {
        set({ isGetting: true });
        try {
            const res = await axiosInstance.get("http://localhost:5001/api/recipe/recipes");
            set({ recipes: res.data }); // Guarda la lista en el estado
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al obtener ingredientes.");
        } finally {
            set({ isGetting: false });
        }
    },

    updateRecipe: async (id, updatedData) => {
        try {
            await axiosInstance.post(`http://localhost:5001/api/recipe/updt/${id}`, updatedData);
            toast.success("Recipe updated");
            const recipes = get().recipes.map((ing) =>
                ing._id === id ? { ...ing, ...updatedData } : ing
            );
            set({ recipes });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al actualizar receta");
        }
    },

    deleteRecipes: async (id) => {
    try {
        await axiosInstance.delete(`http://localhost:5001/api/recipe/del/${id}`);
        
        const updatedRecipe = get().recipes.filter((ing) => ing._id !== id);
        set({ recipes: updatedRecipe });

        toast.success("Recipe deleted");
    } catch (error) {
        toast.error(error.response?.data?.message || "Error al eliminar receta");
    }
},

}));