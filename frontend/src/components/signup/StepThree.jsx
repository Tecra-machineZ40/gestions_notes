function StepThree({ formData, errors, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={onChange}
          className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
          placeholder="Mot de passe"
        />
        {errors.password && <p className="mt-2 text-sm text-red-700">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-2">
          Confirmation du mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={onChange}
          className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
          placeholder="Confirmation du mot de passe"
        />
        {errors.confirmPassword && <p className="mt-2 text-sm text-red-700">{errors.confirmPassword}</p>}
      </div>
    </div>
  );
}

export default StepThree;
