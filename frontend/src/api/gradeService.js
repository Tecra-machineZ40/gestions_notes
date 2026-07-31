/**
 * Service Matière/Notes - Gestion des notes et évaluations
 * Endpoints: /api/matieres/, /api/matieres/statistiques/, /api/matieres/calculer_moyennes/
 */

import api from "./axios";

// ============================================================================
// 📝 MATIÈRES/NOTES
// ============================================================================

/**
 * Récupère toutes les notes avec filtres optionnels
 * GET /matieres/?filters
 */
export const getGrades = async (filters = {}) => {
  try {
    const response = await api.get("/matieres/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération notes:", error);
    throw error;
  }
};

/**
 * Récupère les matières académiques avec filtres optionnels
 * GET /matieres-academiques/?filters
 */
export const getAcademicSubjects = async (filters = {}) => {
  try {
    const response = await api.get("/matieres-academiques/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération matières:", error);
    throw error;
  }
};

/**
 * Récupère les notes d'un étudiant spécifique
 * GET /matieres/?etudiant={id}
 */
export const getStudentGrades = async (studentId, filters = {}) => {
  try {
    const response = await api.get("/matieres/", {
      params: { etudiant: studentId, ...filters },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération notes étudiant:", error);
    throw error;
  }
};

/**
 * Récupère une note par ID
 * GET /matieres/{id}/
 */
export const getGrade = async (id) => {
  try {
    const response = await api.get(`/matieres/${id}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération note:", error);
    throw error;
  }
};

/**
 * Crée une nouvelle note (Enseignant/Admin)
 * POST /matieres/
 */
export const createGrade = async (gradeData) => {
  try {
    const response = await api.post("/matieres/", gradeData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur création note:", error);
    throw error;
  }
};

/**
 * Modifie une note (Enseignant/Admin)
 * PATCH /matieres/{id}/
 */
export const updateGrade = async (id, gradeData) => {
  try {
    const response = await api.patch(`/matieres/${id}/`, gradeData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur modification note:", error);
    throw error;
  }
};

/**
 * Supprime une note (Admin)
 * DELETE /matieres/{id}/
 */
export const deleteGrade = async (id) => {
  try {
    await api.delete(`/matieres/${id}/`);
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur suppression note:", error);
    throw error;
  }
};

/**
 * Récupère les statistiques des notes
 * GET /matieres/statistiques/
 */
export const getGradeStatistics = async () => {
  try {
    const response = await api.get("/matieres/statistiques/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération statistiques:", error);
    throw error;
  }
};

/**
 * Recalcule toutes les moyennes
 * POST /matieres/calculer_moyennes/
 */
export const recalculateAverages = async () => {
  try {
    const response = await api.post("/matieres/calculer_moyennes/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur recalcul moyennes:", error);
    throw error;
  }
};

/**
 * Récupère les notes d'une UE
 * GET /matieres/?ue={id}
 */
export const getCourseGrades = async (courseId, filters = {}) => {
  try {
    const response = await api.get("/matieres/", {
      params: { ue: courseId, ...filters },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération notes du cours:", error);
    throw error;
  }
};

// ============================================================================
// 📊 RÉSULTATS
// ============================================================================

/**
 * Récupère tous les résultats d'UE avec filtres optionnels
 * GET /resultats-ue/?filters
 */
export const getUEResults = async (filters = {}) => {
  try {
    const response = await api.get("/resultats-ue/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération résultats UE:", error);
    throw error;
  }
};

/**
 * Récupère les résultats d'UE d'un étudiant
 * GET /resultats-ue/?etudiant={id}
 */
export const getStudentUEResults = async (studentId, filters = {}) => {
  try {
    const response = await api.get("/resultats-ue/", {
      params: { etudiant: studentId, ...filters },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération résultats UE étudiant:", error);
    throw error;
  }
};

/**
 * Récupère tous les résultats de semestre avec filtres optionnels
 * GET /resultats-semestres/?filters
 */
export const getSemesterResults = async (filters = {}) => {
  try {
    const response = await api.get("/resultats-semestres/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération résultats semestre:", error);
    throw error;
  }
};

/**
 * Récupère les résultats de semestre d'un étudiant
 * GET /resultats-semestres/?etudiant={id}
 */
export const getStudentSemesterResults = async (studentId, filters = {}) => {
  try {
    const response = await api.get("/resultats-semestres/", {
      params: { etudiant: studentId, ...filters },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération résultats semestre étudiant:", error);
    throw error;
  }
};

export default {
  getGrades,
  getAcademicSubjects,
  getStudentGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradeStatistics,
  recalculateAverages,
  getCourseGrades,
  getUEResults,
  getStudentUEResults,
  getSemesterResults,
  getStudentSemesterResults,
};
