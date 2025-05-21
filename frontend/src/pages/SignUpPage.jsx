import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Mail, User, Lock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/SignUpPage.css";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const { signup, isSigningUp } = useAuthStore();

    const validateForm = () => {
        if (!formData.fullName.trim()) return toast.error("Full name is required");
        if (!formData.email.trim()) return toast.error("Email is required");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
        if (!formData.password) return toast.error("Password is required");
        if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const success = validateForm()

        if (success === true) signup(formData);
    };

    return <div className="lg:bg-background-pattern bg-no-repeat bg-cover bg-center w-full h-screen grid lg:grid-cols-2 font-title">
        {/* left side */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center gap-2 group">
                        <h1 className="text-2xl font-bold signup-title">Crea una cuenta</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium mb-2">Nombre de usuario</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="size-5 text-base-content/40" />
                            </div>
                            <input
                                type="text"
                                className={`input w-full pl-10 shadow-md border-none`}
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium mb-2">Correo electrónico</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="size-5 text-base-content/40" />
                            </div>
                            <input
                                type="text"
                                className={`input w-full pl-10 shadow-md border-none`}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contraseña */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium mb-2">Contraseña</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="size-5 text-base-content/40" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input w-full pl-10 shadow-md border-none"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-5 text-base-content/40 icon" />
                                    ) : (
                                        <Eye className="size-5 text-base-content/40 icon" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Repetir Contraseña */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium mb-2">Repetir contraseña</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="size-5 text-base-content/40" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input w-full pl-10 shadow-md border-none"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-5 text-base-content/40 icon" />
                                    ) : (
                                        <Eye className="size-5 text-base-content/40 icon" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full font-bold" disabled={isSigningUp}>
                        {isSigningUp ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                            </>
                        ) : (
                            "Comenzar"
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <div className="flex flex-col items-center">
                        <h1 className="label-text font-medium">o regístrate con</h1>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-base-content/60 link-text">
                    ¿Tienes una cuenta?{" "}
                    <Link to="/login" className="link link-primary link-text font-bold">
                        Inicia Sesión
                    </Link>
                    </p>
                </div>
            </div>
        </div>
    </div>;
};
export default SignUpPage;
