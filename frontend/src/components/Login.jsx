import { useState, useEffect, useRef } from "react";
import { login } from "../api/authService.js";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef(null);

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Veuillez entrer votre nom d\"utilisateur";
    }
    if (!formData.password) {
      newErrors.password = "Veuillez entrer votre mot de passe";
    }
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const username = formData.username.trim();
      const normalizedUsername = username.includes('@') ? username.toLowerCase() : username;
      const response = await login(normalizedUsername, formData.password);
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      localStorage.setItem("user", JSON.stringify(response.user));
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      const errorMessage = error.message || "Identifiants incorrects";
      setErrors({ form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl border border-blue-700 bg-white p-8 rounded-none">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Connexion réussie</h1>
            <p className="mt-4 text-sm text-slate-600">Redirection vers votre tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl border border-blue-700 bg-white p-8 rounded-none">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Connexion</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Se connecter</h1>
          <p className="mt-2 text-sm text-slate-600">
            Entrez vos identifiants pour accéder à votre compte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-slate-900 mb-2">
              Email ou nom d'utilisateur
            </label>
            <input
              ref={usernameRef}
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
              placeholder="Votre email ou nom d'utilisateur"
            />
            {errors.username && <p className="mt-2 text-sm text-red-700">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-sm border border-slate-300 px-4 py-3 pr-12 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-700">{errors.password}</p>}
            <div className="mt-2 text-right">
              <div className="flex items-center justify-end gap-4">
                <a href="/forgot-password" className="text-sm text-blue-700 hover:text-blue-800">
                  Mot de passe oublié ?
                </a>
                <a href="/activate-account" className="text-sm text-blue-700 hover:text-blue-800">
                  Activer un compte
                </a>
              </div>
            </div>
          </div>

          {errors.form && <p className="text-sm text-red-700 text-center">{errors.form}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-sm font-semibold text-white bg-blue-700 border border-blue-700 rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <a href="/signup" className="text-sm font-semibold text-slate-900 text-left">Créer un compte</a>
          <a href="/activate-account" className="text-sm font-semibold text-blue-700 text-left sm:text-right">Validation</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
