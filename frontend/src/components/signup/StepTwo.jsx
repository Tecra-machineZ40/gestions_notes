import { useEffect, useMemo } from 'react';

function StepTwo({ formData, errors, onChange, onFileChange }) {
  const previewUrl = useMemo(() => {
    if (!formData.justificatif) {
      return null;
    }

    return URL.createObjectURL(formData.justificatif);
  }, [formData.justificatif]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files?.[0]) {
      onFileChange(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="matricule" className="block text-sm font-semibold text-slate-900 mb-2">
          Matricule
        </label>
        <input
          id="matricule"
          name="matricule"
          type="text"
          value={formData.matricule}
          onChange={onChange}
          className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
          placeholder="Matricule"
        />
        {errors.matricule && <p className="mt-2 text-sm text-red-700">{errors.matricule}</p>}
      </div>

      <div>
        <label htmlFor="classe" className="block text-sm font-semibold text-slate-900 mb-2">
          Classe
        </label>
        <input
          id="classe"
          name="classe"
          type="text"
          value={formData.classe}
          onChange={onChange}
          className="w-full rounded-sm border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-700"
          placeholder="Classe"
        />
        {errors.classe && <p className="mt-2 text-sm text-red-700">{errors.classe}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Justificatif</label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full rounded-sm border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600"
        >
          <p>Glisser-déposer une image ici ou utiliser le bouton ci-dessous</p>
          <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-sm border border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-700">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                if (event.target.files?.[0]) onFileChange(event.target.files[0]);
              }}
            />
            Parcourir
          </label>
        </div>
        {errors.justificatif && <p className="mt-2 text-sm text-red-700">{errors.justificatif}</p>}
        {previewUrl && (
          <div className="mt-4 rounded-sm border border-slate-300 bg-white p-3">
            <p className="text-sm font-semibold text-slate-900 mb-2">Aperçu du justificatif</p>
            <img src={previewUrl} alt="aperçu justificatif" className="h-40 w-full object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StepTwo;
