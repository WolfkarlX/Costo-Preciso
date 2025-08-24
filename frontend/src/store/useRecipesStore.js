import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

export const useRecipesStore = create((set, get) => ({
    ingredients: [],
    recipes: [],
    isCreating: false,
    isUpdating: false,
    isGetting: false,
    isDeleting: false,
    deletingId: null, // ID de la receta que se está eliminando

    fetchIngredients: async () => {
        set({ isGetting: true });
        try {
            const res = await axiosInstance.get("ingredient/ingredients");
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
            const res = await axiosInstance.post("/recipe/create", data);
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
            const res = await axiosInstance.get("/recipe/recipes");
            set({ recipes: res.data }); // Guarda la lista en el estado
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al obtener recetas.");
        } finally {
            set({ isGetting: false });
        }
    },

    updateRecipe: async (id, updatedData) => {
    set({ isUpdating: true });
    try {
        await axiosInstance.post(`/recipe/updt/${id}`, updatedData);
        toast.success("Recipe updated");
        
        // Llama a fetchRecipes para actualizar la lista desde el servidor
        await get().fetchRecipes();
    } catch (error) {
        toast.error(error.response?.data?.message || "Error al actualizar receta");
    }finally {
        set({ isUpdating: false });
    }
    },

    deleteRecipes: async (id) => {
        set({ isDeleting: true, deletingId: id }); // Activar estado de eliminación y guardar ID
        
        try {
            await axiosInstance.delete(`/recipe/del/${id}`);

            const updateRecipes = get().recipes.filter((ing) => ing._id !== id);
            set({ recipes: updateRecipes });

            toast.success("Recipe deleted");

            // Llama a fetchRecipes para obtener la lista actualizada
            await get().fetchRecipes();
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al eliminar receta");
        }finally {
            set({ isDeleting: false, deletingId: null }); // Desactivar estado de eliminación
        }
    },


}));