import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

export const useIngredientsStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isCreating: false,
    isUpdatingProfile:false,

    isCheckingAuth: true,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({authUser: res.data});
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set ({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created succesfully");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    create: async (data) => {
        set({ isCreating: true });
        try {
            const res = await axiosInstance.post("http://localhost:5001/api/ingredient/create", data);
            set({ authUser: res.data });
            toast.success("Ingredient Added");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isCreating: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            localStorage.clear();
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
}));