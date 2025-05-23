import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import SalesPage from "./pages/SalesPage";
import PercentagesPage from "./pages/PercentagesPage";
import IngredientsPage from "./pages/IngredientsPage";


import { Navigate } from "react-router-dom";

import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth} = useAuthStore();
  
  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  console.log({ authUser });

  if(isCheckingAuth && !authUser) 
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  
  return (
    <div>
      {authUser?<Navbar />: ""}
      
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
        <Route path="/ingredients" element={authUser ? <IngredientsPage /> : <Navigate to="/login" />} />
        <Route path="/percentages" element={authUser ? <PercentagesPage /> : <Navigate to="/login" />} />
        <Route path="/sales" element={authUser ? <SalesPage /> : <Navigate to="/login" />} />

      </Routes>

      <Toaster />
    </div>
  );
};
export default App;