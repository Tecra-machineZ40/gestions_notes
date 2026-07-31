function StepOne({ formData, errors, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="firstName" className="block text-sm font-semibold text-slate-900 mb-2">
          Prénom
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={onChange}
          className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
          placeholder="Prénom"
        />
        {errors.firstName && <p className="mt-2 text-sm text-red-700">{errors.firstName}</p>}
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-semibold text-slate-900 mb-2">
          Nom
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={onChange}
          className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
          placeholder="Nom"
        />
        {errors.lastName && <p className="mt-2 text-sm text-red-700">{errors.lastName}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
          placeholder="Email"
        />
        {errors.email && <p className="mt-2 text-sm text-red-700">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-semibold text-slate-900 mb-2">
          Rôle
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={onChange}
          className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
        >
          <option value="etudiant">Étudiant</option>
          <option value="enseignant">Enseignant</option>
          <option value="superviseur">Superviseur</option>
          <option value="administrateur">Administrateur</option>
        </select>
        {errors.role && <p className="mt-2 text-sm text-red-700">{errors.role}</p>}
      </div>
    </div>
  );
}

export default StepOne;
