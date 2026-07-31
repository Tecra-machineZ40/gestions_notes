/**
 * Service Étudiant - Données des étudiants
 * Endpoints: /api/etudiants/, /api/etudiants/mon_profil/, /api/etudiants/mes_notes/
 */

import api from "./axios";

// ============================================================================
// 👨‍🎓 ÉTUDIANTS
// ============================================================================

/**
 * Récupère le profil étudiant de l'utilisateur connecté
 * GET /etudiants/mon_profil/
 */
export const getMyProfile = async () => {
  try {
    const response = await api.get("/etudiants/mon_profil/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération profil:", error);
    throw error;
  }
};

/**
 * Met à jour le profil étudiant connecté
 * PATCH /etudiants/mon_profil/
 */
export const updateMyProfile = async (payload) => {
  try {
    const response = await api.patch("/etudiants/mon_profil/", payload);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur mise à jour profil étudiant:", error);
    throw error;
  }
};

/**
 * Récupère le profil enseignant connecté
 * GET /enseignants/mon_profil/
 */
export const getMyTeacherProfile = async () => {
  try {
    const response = await api.get("/enseignants/mon_profil/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération profil enseignant:", error);
    throw error;
  }
};

/**
 * Met à jour le profil enseignant connecté
 * PATCH /enseignants/mon_profil/
 */
export const updateMyTeacherProfile = async (payload) => {
  try {
    const response = await api.patch("/enseignants/mon_profil/", payload);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur mise à jour profil enseignant:", error);
    throw error;
  }
};

/**
 * Récupère le profil superviseur connecté
 * GET /superviseurs/mon_profil/
 */
export const getMySupervisorProfile = async () => {
  try {
    const response = await api.get("/superviseurs/mon_profil/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération profil superviseur:", error);
    throw error;
  }
};

/**
 * Met à jour le profil superviseur connecté
 * PATCH /superviseurs/mon_profil/
 */
export const updateMySupervisorProfile = async (payload) => {
  try {
    const response = await api.patch("/superviseurs/mon_profil/", payload);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur mise à jour profil superviseur:", error);
    throw error;
  }
};

/**
 * Récupère les notes de l'étudiant connecté
 * GET /etudiants/mes_notes/
 */
export const getMyGrades = async () => {
  try {
    const response = await api.get("/etudiants/mes_notes/");
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération notes:", error);
    throw error;
  }
};

/**
 * Récupère la liste de tous les étudiants (Admin/Superviseur)
 * GET /etudiants/?search=&ordering=
 */
export const getAllStudents = async (filters = {}) => {
  try {
    const response = await api.get("/etudiants/", { params: filters });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération étudiants:", error);
    throw error;
  }
};

/**
 * Récupère un étudiant par ID
 * GET /etudiants/{id}/
 */
export const getStudent = async (id) => {
  try {
    const response = await api.get(`/etudiants/${id}/`);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur récupération étudiant:", error);
    throw error;
  }
};

/**
 * Crée un nouvel étudiant (Admin)
 * POST /etudiants/
 */
export const createStudent = async (studentData) => {
  try {
    const response = await api.post("/etudiants/", studentData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur création étudiant:", error);
    throw error;
  }
};

/**
 * Modifie un étudiant (Admin)
 * PUT /etudiants/{id}/
 */
export const updateStudent = async (id, studentData) => {
  try {
    const response = await api.put(`/etudiants/${id}/`, studentData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur modification étudiant:", error);
    throw error;
  }
};

/**
 * Supprime un étudiant (Admin)
 * DELETE /etudiants/{id}/
 */
export const deleteStudent = async (id) => {
  try {
    await api.delete(`/etudiants/${id}/`);
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur suppression étudiant:", error);
    throw error;
  }
};

export default {
  getMyProfile,
  updateMyProfile,
  getMyTeacherProfile,
  updateMyTeacherProfile,
  getMySupervisorProfile,
  updateMySupervisorProfile,
  getMyGrades,
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
