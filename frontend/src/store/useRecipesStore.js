import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

export const useRecipesStore = create((set, get) => ({
    isCreating: false,

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
}));