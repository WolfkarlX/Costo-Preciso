import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/SignUpPage.css";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const { login, isLoggingIn } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        login(formData);
    };
    return (
        <div className="lg:bg-background-pattern bg-no-repeat bg-cover bg-center w-full h-screen grid lg:grid-cols-2 font-title">
        {/* left side */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center gap-2 group">
                        <h1 className="text-2xl font-bold signup-title">Inicio de sesión</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                className={`input w-full pl-10 shadow-md border-none`}
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

                    <div className="text-right">
                        <Link to="/" className="link link-primary">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button type="submit" className="btn btn-primary w-full font-bold" disabled={isLoggingIn}>
                        {isLoggingIn ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Comenzar"
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <div className="flex flex-col items-center">
                        <h1 className="label-text font-medium">o inicia sesión con</h1>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-base-content/60 link-text">
                    ¿No tienes una cuenta?{" "}
                    <Link to="/signup" className="link link-primary font-bold">
                        Regístrate
                    </Link>
                    </p>
                </div>
            </div>
        </div>
    </div>
    );
};
export default LoginPage;
