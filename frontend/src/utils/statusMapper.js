/**
 * Fonction pour mapper les codes de statut aux labels en français
 * @param {string} code - Le code de statut (V, NV, NE)
 * @returns {string} Le label en français
 */
export function getStatusLabel(code) {
  const statusMap = {
    V: "Validée",
    NV: "Non Validée",
    NE: "Note Éliminatoire",
  };
  return statusMap[code] || code || "—";
}

/**
 * Fonction pour obtenir la couleur CSS correspondant au statut
 * @param {string} code - Le code de statut (V, NV, NE)
 * @returns {string} La classe CSS de couleur
 */
export function getStatusColor(code) {
  const colorMap = {
    V: "text-green-600 bg-green-50",
    NV: "text-yellow-600 bg-yellow-50",
    NE: "text-red-600 bg-red-50",
  };
  return colorMap[code] || "text-slate-600 bg-slate-50";
}
