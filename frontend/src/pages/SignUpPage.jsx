import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Mail, User, Lock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/SignUpPage.css";

import { GoogleLogin } from "@react-oauth/google";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const { signup, googleLogin, isSigningUp, isLoggingIn } = useAuthStore();
    const [passwordFocused, setPasswordFocused] = useState(false); // mostrar como debe ir la contra


    const isPasswordSecureHasNumber = (password) => {
        const hasNumber = /\d/.test(password);

        return hasNumber;
    };

    const isPasswordSecureHasLetter = (password) => {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);

        return hasUpper && hasLower;
    };

    const isPasswordSecureHasSpecial = (password) => {
        const hasSpecial = /[-*?!@#$\/()\{\}=.,;:]/.test(password);

        return hasSpecial;
    };

    const isPasswordSecureNoSpaces = (password) => {
        const noSpaces = !/\s/.test(password);

        return noSpaces;
    };

    const isPasswordSecureNoRepeatCharts = (password) => {
        const noRepeatChars = !/(.)\1{2,}/.test(password);

        return noRepeatChars;
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) return toast.error("Ingrese su nombre");
        if (!formData.email.trim()) return toast.error("Ingrese su correo");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Formato de email inválido");
        if (!formData.password) return toast.error("Ingrese una contraseña");
        if (formData.password.length < 8) return toast.error("La contraseña debe contener al menos 8 caracteres");
        
        if (!isPasswordSecureHasNumber(formData.password)) return toast.error("La contraseña debe incluir al menos un número");
        if (!isPasswordSecureHasLetter(formData.password)) return toast.error("La contraseña debe incluir al menos una letra mayúscula y una minúscula");
        if (!isPasswordSecureHasSpecial(formData.password)) return toast.error("La contraseña debe incluir al menos un caracter especial");
        if (!isPasswordSecureNoSpaces(formData.password)) return toast.error("La contraseña NO debe tener espacios");
        if (!isPasswordSecureNoRepeatCharts(formData.password)) return toast.error("La contraseña NO debe repetir caracteres (ej. 1111111)");

        if (!formData.confirmPassword.trim()) return toast.error("Confirme la contraseña");
        if (formData.password !== formData.confirmPassword) return toast.error("Las contraseñas no coinciden");

        return true;
    };

    const initialFormState = {
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const success = validateForm()

        if (success === true) {
            signup(formData);
            setFormData(initialFormState); // limpia SOLO si es válido
        }
    };

    const handleGoogleLoginSuccess = (credentialResponse) => {
        const tokenId = credentialResponse.credential;
        googleLogin(tokenId);
      };

      const handleGoogleLoginError = () => {
        toast.error("Google sign up failed");
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
                <input
                  type="text"
                  className={`input w-full pl-10 shadow-md border-none`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
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
                                    onFocus={() => setPasswordFocused(true)}        // <--- Aquí
                                    onBlur={() => setPasswordFocused(false)}        // <--- Aquí
                                />

                                {passwordFocused && (
                                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md p-3 shadow-md text-sm text-gray-700 z-10">
                                        <p className="font-semibold mb-1">Tu contraseña debe incluir:</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            <li>Al menos 8 caracteres</li>
                                            <li>Una letra mayúscula y una minúscula</li>
                                            <li>Un número</li>
                                            <li>Un carácter especial (- * ? ! @ # $ / () {} = . , ; :)</li>
                                            <li>Sin espacios en blanco</li>
                                            <li>No repetir caracteres seguidos (ej. 111)</li>
                                        </ul>
                                    </div>
                                )}

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

              {/* Confirmar contraseña */}
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

            <button type="submit" className="btn btn-primary w-full font-bold" disabled={isSigningUp || isLoggingIn}>
              {(isSigningUp || isLoggingIn) ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Comenzar"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <h1 className="label-text font-medium">o regístrate con</h1>
          </div>

          <div className="flex justify-center mt-4">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap
              text="continue_with"
            />
          </div>

          <div className="text-center mt-4">
            <p className="text-base-content/60 link-text">
              ¿Tienes una cuenta?{" "}
              <Link to="/login" className="link link-primary link-text font-bold">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
