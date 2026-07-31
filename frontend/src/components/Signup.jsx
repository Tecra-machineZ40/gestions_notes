import { useState } from 'react';
import { register } from '../api/authService.js';
import StepOne from './signup/StepOne.jsx';
import StepTwo from './signup/StepTwo.jsx';
import StepThree from './signup/StepThree.jsx';

const initialData = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'etudiant',
  matricule: '',
  classe: '',
  justificatif: null,
  password: '',
  confirmPassword: '',
};

const fieldLabels = {
  firstName: 'Veuillez entrer votre prénom',
  lastName: 'Veuillez entrer votre nom',
  email: 'Veuillez entrer votre email',
  role: 'Sélectionnez un rôle',
  matricule: 'Veuillez entrer votre matricule',
  classe: 'Veuillez entrer votre classe',
  justificatif: 'Veuillez ajouter un justificatif',
  password: 'Veuillez entrer un mot de passe',
  confirmPassword: 'Veuillez confirmer le mot de passe',
};

function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (file) => {
    setFormData((prev) => ({ ...prev, justificatif: file }));
    setErrors((prev) => ({ ...prev, justificatif: '' }));
  };

  const validateStep = (currentStep) => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) nextErrors.firstName = fieldLabels.firstName;
      if (!formData.lastName.trim()) nextErrors.lastName = fieldLabels.lastName;
      if (!formData.email.trim()) nextErrors.email = fieldLabels.email;
      if (!formData.role.trim()) nextErrors.role = fieldLabels.role;
    }

    if (currentStep === 2) {
      if (!formData.matricule.trim()) nextErrors.matricule = fieldLabels.matricule;
      if (!formData.classe.trim()) nextErrors.classe = fieldLabels.classe;
      if (!formData.justificatif) nextErrors.justificatif = fieldLabels.justificatif;
    }

    if (currentStep === 3) {
      if (!formData.password) nextErrors.password = fieldLabels.password;
      if (!formData.confirmPassword) nextErrors.confirmPassword = fieldLabels.confirmPassword;
      if (formData.password && formData.password.length < 8) {
        nextErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    return nextErrors;
  };

  const handleNext = (event) => {
    event.preventDefault();
    const nextErrors = validateStep(step);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setErrors({});
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const finalErrors = validateStep(3);
    if (Object.keys(finalErrors).length) {
      setErrors(finalErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const body = new FormData();
      const normalizedEmail = formData.email.trim().toLowerCase();

      body.append('username', normalizedEmail);
      body.append('first_name', formData.firstName.trim());
      body.append('last_name', formData.lastName.trim());
      body.append('email', normalizedEmail);
      body.append('password', formData.password);
      body.append('role', formData.role);
      body.append('preuve_appartenance', formData.justificatif);

      await register(body);
      setSuccess(true);
    } catch (error) {
      const details = error.details;
      const fieldErrors = {};

      if (details?.username?.[0]) {
        fieldErrors.email = details.username[0];
      }
      if (details?.email?.[0]) {
        fieldErrors.email = details.email[0];
      }
      if (details?.password?.[0]) {
        fieldErrors.password = details.password[0];
      }
      if (details?.preuve_appartenance?.[0]) {
        fieldErrors.justificatif = details.preuve_appartenance[0];
      }

      const formMessage =
        error.message ||
        details?.detail ||
        fieldErrors.email ||
        fieldErrors.password ||
        fieldErrors.justificatif ||
        JSON.stringify(details) ||
        'Impossible de créer le compte. Réessayez plus tard.';

      setErrors({ ...fieldErrors, form: formMessage });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl border border-blue-700 bg-white p-8 rounded-none">
          <h1 className="text-2xl font-semibold text-slate-900">Compte créé avec succès</h1>
          <p className="mt-4 text-sm text-slate-600">Votre compte a bien été créé et sera bientôt disponible.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <a
              href="/"
              className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-white bg-blue-700 border border-blue-700 rounded-sm text-center"
            >
              Se connecter
            </a>
            <a
              href="/activate-account"
              className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-slate-900 border border-slate-300 rounded-sm text-center"
            >
              Validation
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl border border-blue-700 bg-white p-8 rounded-none">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Créer un compte</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Créer un compte</h1>
          </div>
          <p className="text-sm font-medium text-slate-600">Étape {step}/3</p>
        </div>

        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-2 flex-1 ${step >= index ? 'bg-blue-700' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-6">
          {step === 1 && <StepOne formData={formData} errors={errors} onChange={handleChange} />}
          {step === 2 && <StepTwo formData={formData} errors={errors} onChange={handleChange} onFileChange={handleFileChange} />}
          {step === 3 && <StepThree formData={formData} errors={errors} onChange={handleChange} />}

          {errors.form && <p className="text-sm text-red-700">{errors.form}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={step === 1}
              className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-slate-900 border border-slate-300 bg-slate-50 rounded-sm disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-white bg-blue-700 border border-blue-700 rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Envoi en cours...' : step === 3 ? "S'inscrire" : 'Suivant'}
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <a href="/" className="text-sm font-semibold text-blue-700 text-left">Se connecter</a>
          <a href="/activate-account" className="text-sm font-semibold text-slate-900 text-left sm:text-right">Validation</a>
        </div>
      </div>
    </div>
  );
}

export default Signup;
