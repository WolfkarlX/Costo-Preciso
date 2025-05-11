import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useRecipeStore = create((set) => ({
  recipes: [],
  materials: [],
  selectedMaterials: [],
  isCreating: false,
  isUpdating: false, // Estado para manejar la carga durante la actualización
  isLoading: false,

  // Función para obtener recetas
  fetchRecipes: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/recipes/all", { withCredentials: true });
      set({ recipes: response.data });
    } catch (error) {
      toast.error("Error al obtener recetas");
    } finally {
      set({ isLoading: false });
    }
  },

  // Función para obtener materiales
  fetchMaterials: async () => {
    try {
      const response = await axiosInstance.get("/materials", { withCredentials: true });
      set({ materials: response.data });
    } catch (error) {
      toast.error("No se pudieron cargar los materiales");
    }
  },

  // Función para crear receta
  createRecipe: async (data, onSuccess) => {
    set({ isCreating: true });
    try {
      // Aquí estamos enviando los materiales correctamente
      await axiosInstance.post("/recipes", data, { withCredentials: true });
      toast.success("Receta agregada con éxito");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("❌ Error al agregar la receta");
    } finally {
      set({ isCreating: false });
    }
  },

  // Función para actualizar receta
  updateRecipe: async (id, data, onSuccess) => {
    set({ isUpdating: true });
    try {
      const response = await axiosInstance.put(`/recipes/${id}`, data, { withCredentials: true });
      // Actualizamos la receta en el estado con los nuevos datos
      set((state) => ({
        recipes: state.recipes.map((recipe) =>
          recipe._id === id ? { ...recipe, ...response.data } : recipe
        ),
      }));
      toast.success("Receta actualizada con éxito");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("❌ Error al actualizar receta");
    } finally {
      set({ isUpdating: false });
    }
  },

  // Función para eliminar receta
  deleteRecipe: async (id) => {
    try {
      await axiosInstance.delete(`/recipes/${id}`, { withCredentials: true });
      set((state) => ({
        recipes: state.recipes.filter((recipe) => recipe._id !== id),
      }));
      toast.success("Receta eliminada correctamente");
    } catch (error) {
      toast.error("❌ Error al eliminar receta");
    }
  },

  // Función para crear material
  createMaterial: async (data, onSuccess) => {
    try {
      const response = await axiosInstance.post("/materials", data, { withCredentials: true });
      toast.success("Material agregado con éxito");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("❌ Error al agregar material");
    }
  },

  // **Aquí agregamos la función updateMaterial**
  updateMaterial: async (id, data, onSuccess) => {
    try {
      const response = await axiosInstance.put(`/materials/${id}`, data, { withCredentials: true });
      // Actualizamos el material en el estado con los nuevos datos
      set((state) => ({
        materials: state.materials.map((material) =>
          material._id === id ? { ...material, ...response.data } : material
        ),
      }));
      toast.success("Material actualizado con éxito");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("❌ Error al actualizar material");
    }
  },

  // Función para eliminar material
  deleteMaterial: async (id, onSuccess) => {
    try {
      await axiosInstance.delete(`/materials/${id}`, { withCredentials: true });
      set((state) => ({
        materials: state.materials.filter((material) => material._id !== id),
      }));
      toast.success("Material eliminado correctamente");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("❌ Error al eliminar material");
    }
  },
}));