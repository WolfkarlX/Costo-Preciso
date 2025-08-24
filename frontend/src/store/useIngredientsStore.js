import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

export const useIngredientsStore = create((set, get) => ({
    isCreating: false,
    isUpdating: false,
    isGetting: false,
    isDeleting: false,
    deletingId: null, // ID del ingrediente que se está eliminando
    ingredients: [],

    create: async (data) => {
        set({ isCreating: true });
        try {
            const res = await axiosInstance.post("/ingredient/create", data);
            toast.success("Ingredient Added");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isCreating: false });
        }
    },

    fetchIngredients: async () => {
        set({ isGetting: true });
        try {
            const res = await axiosInstance.get("/ingredient/ingredients");
            set({ ingredients: res.data }); // Guarda la lista en el estado
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al obtener ingredientes.");
        } finally {
            set({ isGetting: false });
        }
    },

    updateIngredient: async (id, updatedData) => {
        set({ isUpdating: true });
        try {
            await axiosInstance.post(`/ingredient/updt/${id}`, updatedData);
            toast.success("Ingredient updated");
            const ingredients = get().ingredients.map((ing) =>
                ing._id === id ? { ...ing, ...updatedData } : ing
            );
            set({ ingredients });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al actualizar ingrediente");
        } finally {
        set({ isUpdating: false });
        }
    },

     deleteIngredient: async (id) => {
        set({ isDeleting: true, deletingId: id }); // Activar estado de eliminación y guardar ID
        
        try {
            await axiosInstance.delete(`/ingredient/del/${id}`);
            
            const updatedIngredients = get().ingredients.filter((ing) => ing._id !== id);
            set({ ingredients: updatedIngredients });

            toast.success("Ingredient deleted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al eliminar ingrediente");
        } finally {
            set({ isDeleting: false, deletingId: null }); // Desactivar estado de eliminación
        }
    },
}));