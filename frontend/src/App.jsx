import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

// Layout
import Navbar from "./components/Navbar";

// Pages
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import AddRecipe from "./pages/AddRecipe";
import RecipesPage from "./pages/RecipePage";
import EditRecipe from "./pages/EditRecipe";

// Store
import { useAuthStore } from "./store/useAuthStore";

const App = () => {
    const { authUser, checkAuth, isChekingAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isChekingAuth && !authUser)
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );

    return (
        <div>
            <Navbar />

            <Routes>
                <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
                <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
                <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />

                {/* Recetas */}
                <Route path="/recipes" element={authUser ? <RecipesPage /> : <Navigate to="/login" />} />
                <Route path="/recipes/add" element={authUser ? <AddRecipe /> : <Navigate to="/login" />} />
                <Route path="/recipes/edit/:id" element={authUser ? <EditRecipe /> : <Navigate to="/login" />} />
            </Routes>

            <Toaster />
        </div>
    );
};

export default App;
