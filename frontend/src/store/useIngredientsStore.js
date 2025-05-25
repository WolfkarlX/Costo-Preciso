import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

export const useIngredientsStore = create((set) => ({
    isCreating: false,
    isGetting: false,
    ingredients: [],

    create: async (data) => {
        set({ isCreating: true });
        try {
            const res = await axiosInstance.post("http://localhost:5001/api/ingredient/create", data);
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
            const res = await axiosInstance.get("http://localhost:5001/api/ingredient/ingredients");
            set({ ingredients: res.data }); // Guarda la lista en el estado
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al obtener ingredientes.");
        } finally {
            set({ isGetting: false });
        }
    },

}));