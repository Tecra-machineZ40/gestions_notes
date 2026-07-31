import { useState, useEffect, useRef } from 'react';
import { activateAccount } from '../api/authService.js';

function CodeInput({ value, onChange, onComplete }) {
  const inputsRef = useRef([]);

  const handleChange = (index, inputValue) => {
    if (inputValue.length > 1) {
      // Gestion du collage d'un code complet
      const code = inputValue.slice(0, 8).split('');
      const newValue = Array(8).fill('').map((_, i) => code[i] || '');
      onChange(newValue.join(''));

      // Focus sur le dernier champ rempli ou le premier vide
      const lastFilledIndex = newValue.findLastIndex(char => char !== '');
      const focusIndex = lastFilledIndex < 7 ? lastFilledIndex + 1 : 7;
      setTimeout(() => inputsRef.current[focusIndex]?.focus(), 0);
      return;
    }

    // Accepter lettres majuscules et chiffres
    if (!/^[A-Z0-9]?$/i.test(inputValue)) return;

    const newValue = value.split('');
    newValue[index] = inputValue.toUpperCase();
    const updatedValue = newValue.join('');
    onChange(updatedValue);

    // Passage automatique au champ suivant
    if (inputValue && index < 7) {
      setTimeout(() => inputsRef.current[index + 1]?.focus(), 0);
    }

    // Vérifier si le code est complet
    if (updatedValue.length === 8 && !updatedValue.includes('')) {
      onComplete?.(updatedValue);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      // Retour arrière automatique
      setTimeout(() => inputsRef.current[index - 1]?.focus(), 0);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    // Accepter lettres et chiffres du collage
    const pastedData = event.clipboardData.getData('text').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8);
    if (pastedData) {
      handleChange(0, pastedData);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 8 }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="text"
          pattern="[A-Z0-9]"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg font-semibold border border-slate-300 rounded-sm focus:outline-none focus:border-blue-700"
        />
      ))}
    </div>
  );
}

function ActivateAccount() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    code: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer pour le renvoi du code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCodeChange = (code) => {
    setFormData((prev) => ({ ...prev, code }));
    setErrors((prev) => ({ ...prev, code: '' }));
  };

  const handleCodeComplete = () => {
    // Auto-submit quand le code est complet (optionnel)
    // handleSubmit();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Veuillez entrer votre nom d\'utilisateur';
    }

    if (!formData.password) {
      newErrors.password = 'Veuillez entrer votre mot de passe';
    }

    if (!formData.code || formData.code.length !== 8) {
      newErrors.code = 'Veuillez entrer le code complet (8 caractères)';
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
      const response = await activateAccount({
        username: normalizedUsername,
        password: formData.password,
        code_inscription: formData.code,
      });

      // Stocker les tokens et rediriger
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));

      setSuccess(true);

      // Redirection vers le dashboard après un court délai
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (error) {
      const details = error.details;
      const fieldErrors = {};

      if (details?.username?.[0]) {
        fieldErrors.username = details.username[0];
      }
      if (details?.password?.[0]) {
        fieldErrors.password = details.password[0];
      }
      if (details?.code_inscription?.[0]) {
        fieldErrors.code = details.code_inscription[0];
      }
      if (details?.non_field_errors?.[0]) {
        fieldErrors.form = details.non_field_errors[0];
      }

      const errorMessage =
        error.message ||
        details?.detail ||
        details?.username?.[0] ||
        details?.password?.[0] ||
        details?.code_inscription?.[0] ||
        details?.non_field_errors?.[0] ||
        'Code incorrect ou informations invalides';

      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    // Ici, on pourrait appeler une API pour renvoyer le code
    // Pour l'instant, on simule avec un timer
    setResendTimer(30);
    // TODO: Appeler l'API de renvoi de code
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
            <h1 className="text-2xl font-semibold text-slate-900">Compte activé avec succès</h1>
            <p className="mt-4 text-sm text-slate-600">Redirection vers votre tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl border border-blue-700 bg-white p-8 rounded-none">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Validation du compte</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Valider votre compte</h1>
          <p className="mt-2 text-sm text-slate-600">
            Entrez vos informations et le code de confirmation reçu par email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-slate-900 mb-2">
              Email ou nom d'utilisateur
            </label>
            <input
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
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
              placeholder="Votre mot de passe"
            />
            {errors.password && <p className="mt-2 text-sm text-red-700">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-4">
              Code de confirmation
            </label>
            <CodeInput
              value={formData.code}
              onChange={handleCodeChange}
              onComplete={handleCodeComplete}
            />
            {errors.code && <p className="mt-2 text-sm text-red-700 text-center">{errors.code}</p>}
            <p className="mt-2 text-xs text-slate-500 text-center">
              Entrez le code de 8 caractères (lettres et chiffres) reçu par email
            </p>
          </div>

          {errors.form && <p className="text-sm text-red-700 text-center">{errors.form}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendTimer > 0}
              className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-slate-900 border border-slate-300 bg-slate-50 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : 'Renvoyer le code'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-white bg-blue-700 border border-blue-700 rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Validation...' : 'Valider'}
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <a href="/" className="text-sm font-semibold text-blue-700 text-left">Se connecter</a>
          <a href="/signup" className="text-sm font-semibold text-slate-900 text-left sm:text-right">Créer un compte</a>
        </div>
      </div>
    </div>
  );
}

export default ActivateAccount;
