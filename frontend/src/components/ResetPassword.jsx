import { useMemo, useState } from "react";
import { confirmPasswordReset } from "../api/authService";

function ResetPassword() {
  const { uid, token } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const rawUid = params.get("uid") || params.get("uidb64") || "";
    const rawToken = params.get("token") || "";

    return {
      uid: decodeURIComponent(rawUid).trim(),
      token: decodeURIComponent(rawToken).trim(),
    };
  }, []);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!uid || !token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await confirmPasswordReset({ uid, uidb64: uid, token, new_password: newPassword });
      setMessage(response?.detail || "Mot de passe réinitialisé avec succès.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      setError(err?.message || "Réinitialisation impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl border border-blue-700 bg-white p-8 rounded-none">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Réinitialisation</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-slate-600">
            Saisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-900 mb-2">
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
              placeholder="Répétez le mot de passe"
            />
          </div>

          {error ? <p className="text-sm text-red-700 text-center">{error}</p> : null}
          {message ? <p className="text-sm text-green-700 text-center">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-sm font-semibold text-white bg-blue-700 border border-blue-700 rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Validation..." : "Réinitialiser le mot de passe"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/login" className="text-sm font-semibold text-blue-700">Retour connexion</a>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
