import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
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
            toast.success("Se envio correo de confirmacion exitosamente");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Se inició sesión Exitosamente");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

  googleLogin: async (tokenId) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post(
        "/auth/google-login",
        { idToken: tokenId },  // aquí debe coincidir la propiedad que espera backend
        { withCredentials: true }
      );
      set({ authUser: res.data });
      toast.success("Logueado correctamente con Google.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Inicio de sesion con Google fallido.");
    } finally {
      set({ isLoggingIn: false });
    }
  },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            localStorage.clear();
            toast.success("Se cerró sesión Exitosamente");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
}));
