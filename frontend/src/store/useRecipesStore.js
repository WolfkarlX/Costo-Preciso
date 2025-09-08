import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

export const useRecipesStore = create((set, get) => ({
    ingredients: [],
    recipes: [],
    isCreating: false,
    isGetting: false,
    openModal: false,


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
        set({ isCreating: true, openModal: true });
        let open = true

        try {
            const res = await axiosInstance.post("http://localhost:5001/api/recipe/create", data);
            toast.success("Recipe Added");
            open = false
            return res.data;

        } catch (error) {
            toast.error(error.response.data.message);
            open = true

        } finally {
            set({ isCreating: false, openModal: open });
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
        set({ openModal: true });
        let open = true

        try {
            await axiosInstance.post(`http://localhost:5001/api/recipe/updt/${id}`, updatedData);
            toast.success("Recipe updated");
            
            // Llama a fetchRecipes para actualizar la lista desde el servidor
            await get().fetchRecipes();
            open = false
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al actualizar receta");
            open = true

        } finally {
            set({ openModal: open });
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