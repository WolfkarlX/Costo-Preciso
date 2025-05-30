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
            return res.data //retorna el valor directo sin esperar async await
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
            return res.data;
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
        
        // Llama a fetchRecipes para actualizar la lista desde el servidor
        await get().fetchRecipes();
    } catch (error) {
        toast.error(error.response?.data?.message || "Error al actualizar receta");
    }
    },

    deleteRecipes: async (id) => {
        try {
            await axiosInstance.delete(`http://localhost:5001/api/recipe/del/${id}`);
            toast.success("Recipe deleted");

            // Llama a fetchRecipes para obtener la lista actualizada
            await get().fetchRecipes();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al eliminar receta");
        }
    },


}));