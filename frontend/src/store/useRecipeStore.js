// src/store/useRecipeStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useRecipeStore = create((set) => ({
  isCreating: false,

  createRecipe: async (data, onSuccess) => {
    set({ isCreating: true });
    try {
      await axiosInstance.post("/recipes", data, { withCredentials: true });
      toast.success("✅ Receta agregada con éxito");
      if (onSuccess) onSuccess(); // para resetear el formulario u otra lógica
    } catch (error) {
      console.error("Error al agregar receta:", error);
      toast.error("❌ Error al agregar la receta");
    } finally {
      set({ isCreating: false });
    }
  }
}));
