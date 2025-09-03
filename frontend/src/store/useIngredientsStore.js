import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

export const useIngredientsStore = create((set, get) => ({
    isCreating: false,
    isGetting: false,
    openModal: false,
    ingredients: [],

    create: async (data) => {
        set({ isCreating: true, openModal: true});
        let open = true
        
        try {
            const res = await axiosInstance.post("http://localhost:5001/api/ingredient/create", data);
            toast.success("Ingredient Added");
            open = false
        } catch (error) {
            toast.error(error.response.data.message);
            open = true
        } finally {
            set({ isCreating: false, openModal: open });
        }
    },

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

    updateIngredient: async (id, updatedData) => {
        set({ openModal: true});
        let open = true

        try {
            await axiosInstance.post(`http://localhost:5001/api/ingredient/updt/${id}`, updatedData);
            toast.success("Ingredient updated");
            const ingredients = get().ingredients.map((ing) =>
                ing._id === id ? { ...ing, ...updatedData } : ing
            );
            set({ ingredients });
            open = false
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al actualizar ingrediente");
            open = true
        } finally {
            set({ openModal: open });
        }
    },

    deleteIngredient: async (id) => {   
    try {
        await axiosInstance.delete(`http://localhost:5001/api/ingredient/del/${id}`);
        
        const updatedIngredients = get().ingredients.filter((ing) => ing._id !== id);
        set({ ingredients: updatedIngredients });

        toast.success("Ingredient deleted");
    } catch (error) {
        toast.error(error.response?.data?.message || "Error al eliminar ingrediente");
    }
},
}));