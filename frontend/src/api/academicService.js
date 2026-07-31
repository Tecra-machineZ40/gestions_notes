/**
 * Service Structure Académique - Années, Semestres, UE, Sessions
 */

import api from "./axios";

// ============================================================================
// 📚 ANNÉES ACADÉMIQUES
// ============================================================================

/**
 * Récupère toutes les années académiques
 * GET /annees-academiques/
 */
export const getAcademicYears = async () => {
  try {
    const response = await api.get("/annees-academiques/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération années:", error);
    throw error;
  }
};

/**
 * Récupère l'année académique active
 * GET /annees-academiques/actuelle/
 */
export const getCurrentAcademicYear = async () => {
  try {
    const response = await api.get("/annees-academiques/actuelle/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération année actuelle:", error);
    throw error;
  }
};

/**
 * Crée une nouvelle année académique
 * POST /annees-academiques/
 */
export const createAcademicYear = async (yearData) => {
  try {
    const response = await api.post("/annees-academiques/", yearData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur création année:", error);
    throw error;
  }
};

/**
 * Modifie une année académique
 * PUT /annees-academiques/{id}/
 */
export const updateAcademicYear = async (id, yearData) => {
  try {
    const response = await api.put(`/annees-academiques/${id}/`, yearData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur modification année:", error);
    throw error;
  }
};

/**
 * Supprime une année académique
 * DELETE /annees-academiques/{id}/
 */
export const deleteAcademicYear = async (id) => {
  try {
    await api.delete(`/annees-academiques/${id}/`);
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur suppression année:", error);
    throw error;
  }
};

// ============================================================================
// 📅 SEMESTRES
// ============================================================================

/**
 * Récupère tous les semestres avec filtres optionnels
 * GET /semestres/?filters
 */
export const getSemesters = async (filters = {}) => {
  try {
    const response = await api.get("/semestres/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération semestres:", error);
    throw error;
  }
};

/**
 * Récupère les semestres d'une année
 * GET /semestres/?annee_academique={id}
 */
export const getYearSemesters = async (yearId) => {
  try {
    const response = await api.get("/semestres/", {
      params: { annee_academique: yearId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération semestres année:", error);
    throw error;
  }
};

/**
 * Crée un nouveau semestre
 * POST /semestres/
 */
export const createSemester = async (semesterData) => {
  try {
    const response = await api.post("/semestres/", semesterData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur création semestre:", error);
    throw error;
  }
};

/**
 * Modifie un semestre
 * PUT /semestres/{id}/
 */
export const updateSemester = async (id, semesterData) => {
  try {
    const response = await api.put(`/semestres/${id}/`, semesterData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur modification semestre:", error);
    throw error;
  }
};

/**
 * Supprime un semestre
 * DELETE /semestres/{id}/
 */
export const deleteSemester = async (id) => {
  try {
    await api.delete(`/semestres/${id}/`);
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur suppression semestre:", error);
    throw error;
  }
};

// ============================================================================
// 📖 UNITÉS D'ENSEIGNEMENT (UE)
// ============================================================================

/**
 * Récupère toutes les UE avec filtres optionnels
 * GET /ues/?filters
 */
export const getCourses = async (filters = {}) => {
  try {
    const response = await api.get("/ues/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération UE:", error);
    throw error;
  }
};

/**
 * Récupère une UE spécifique
 * GET /ues/{id}/
 */
export const getCourse = async (id) => {
  try {
    const response = await api.get(`/ues/${id}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération UE:", error);
    throw error;
  }
};

/**
 * Récupère les UE enseignées par l'utilisateur
 * GET /ues/mes_ues/
 */
export const getMyTeachingCourses = async () => {
  try {
    const response = await api.get("/ues/mes_ues/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération mes UE:", error);
    throw error;
  }
};

/**
 * Récupère les matières assignées à l'enseignant connecté
 * GET /enseignants/mes_matieres/
 */
export const getMyTeachingSubjects = async () => {
  try {
    const response = await api.get("/enseignants/mes_matieres/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération mes matières:", error);
    throw error;
  }
};

/**
 * Crée une nouvelle UE
 * POST /ues/
 */
export const createCourse = async (courseData) => {
  try {
    const response = await api.post("/ues/", courseData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur création UE:", error);
    throw error;
  }
};

/**
 * Modifie une UE
 * PUT /ues/{id}/
 */
export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/ues/${id}/`, courseData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur modification UE:", error);
    throw error;
  }
};

/**
 * Supprime une UE
 * DELETE /ues/{id}/
 */
export const deleteCourse = async (id) => {
  try {
    await api.delete(`/ues/${id}/`);
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur suppression UE:", error);
    throw error;
  }
};

// ============================================================================
// 🗓️ SESSIONS
// ============================================================================

/**
 * Récupère toutes les sessions
 * GET /sessions/
 */
export const getSessions = async () => {
  try {
    const response = await api.get("/sessions/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération sessions:", error);
    throw error;
  }
};

export default {
  getAcademicYears,
  getCurrentAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getSemesters,
  getYearSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  getCourses,
  getCourse,
  getMyTeachingCourses,
  getMyTeachingSubjects,
  createCourse,
  updateCourse,
  deleteCourse,
  getSessions,
};
