import { useState } from "react";
import { requestPasswordReset } from "../api/authService";

function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [debugResetLink, setDebugResetLink] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!identifier.trim()) {
      setError("Veuillez saisir votre email ou votre nom d'utilisateur.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");
    setDebugResetLink("");

    try {
      const response = await requestPasswordReset(identifier.trim());
      setMessage(
        response?.detail ||
          "Si un compte correspond, un email de réinitialisation a été envoyé."
      );
      if (response?.debug_reset_link) {
        setDebugResetLink(response.debug_reset_link);
      }
    } catch (err) {
      setError(err?.message || "Impossible d'envoyer la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl border border-blue-700 bg-white p-8 rounded-none">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Récupération</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-slate-600">
            Entrez votre email ou votre nom d'utilisateur. Un lien de réinitialisation vous sera envoyé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-semibold text-slate-900 mb-2">
              Email ou nom d'utilisateur
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
              placeholder="votre.email@exemple.com"
            />
          </div>

          {error ? <p className="text-sm text-red-700 text-center">{error}</p> : null}
          {message ? <p className="text-sm text-green-700 text-center">{message}</p> : null}
          {debugResetLink ? (
            <div className="text-sm text-slate-700 border border-slate-300 bg-slate-50 p-3">
              <p className="font-semibold mb-1">Lien de test (mode debug):</p>
              <a href={debugResetLink} className="text-blue-700 underline hover:text-blue-800">Réinitialiser</a>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-sm font-semibold text-white bg-blue-700 border border-blue-700 rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>

        <div className="mt-8 flex justify-between">
          <a href="/login" className="text-sm font-semibold text-blue-700">Retour connexion</a>
          <a href="/activate-account" className="text-sm font-semibold text-slate-900">Activer un compte</a>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
