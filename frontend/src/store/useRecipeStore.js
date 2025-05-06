// src/store/useRecipeStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useRecipeStore = create((set) => ({
  isCreating: false,
  ingredients: [], // ← Estado inicial para ingredientes

  createRecipe: async (data, onSuccess) => {
    set({ isCreating: true });
    try {
      await axiosInstance.post("/recipes", data, { withCredentials: true });
      toast.success("Receta agregada con éxito");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al agregar receta:", error);
      toast.error("❌ Error al agregar la receta");
    } finally {
      set({ isCreating: false });
    }
  },

  getIngredients: async () => {
    try {
      const res = await axiosInstance.get("/ingredients", {
        withCredentials: true,
      });
      set({ ingredients: res.data });
    } catch (error) {
      console.error("Error al obtener ingredientes:", error);
      toast.error("❌ No se pudieron cargar los ingredientes");
    }
  },
}));
