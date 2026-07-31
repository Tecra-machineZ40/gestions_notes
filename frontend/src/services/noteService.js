import api from "../api/axios";

const buildNoteFormData = (noteData) => {
  const formData = new FormData();
  formData.append("etudiant", noteData.etudiant);
  formData.append("matiere", noteData.matiere);
  formData.append("note_devoir", noteData.note_devoir);
  formData.append("note_examen", noteData.note_examen);
  formData.append("note_matiere", noteData.note_matiere);

  if (noteData.superviseur) {
    formData.append("superviseur", noteData.superviseur);
  }

  if (noteData.statut) {
    formData.append("statut", noteData.statut);
  }

  return formData;
};

// Récupère toutes les notes (endpoint: /api/matieres/)
export const getNotes = async (filters = {}) => {
  const response = await api.get("/matieres/", { params: filters });
  return response.data;
};

// Récupère tous les étudiants
export const getEtudiants = async (filters = {}) => {
  const response = await api.get("/etudiants/", { params: filters });
  return response.data;
};

// Récupère toutes les matières académiques
export const getMatieres = async (filters = {}) => {
  const response = await api.get("/matieres-academiques/", { params: filters });
  return response.data;
};

// Récupère tous les enseignants
export const getEnseignants = async (filters = {}) => {
  const response = await api.get("/enseignants/", { params: filters });
  return response.data;
};

// Récupère toutes les sessions
export const getEvaluations = async () => {
  const response = await api.get("/sessions/");
  return response.data;
};

// Crée une nouvelle note
export const createNote = async (noteData) => {
  const response = await api.post("/matieres/", buildNoteFormData(noteData));
  return response.data;
};

// Met à jour une note existante
export const updateNote = async (noteId, noteData) => {
  const response = await api.patch(`/matieres/${noteId}/`, buildNoteFormData(noteData));
  return response.data;
};

// Supprime une note
export const deleteNote = async (noteId) => {
  await api.delete(`/matieres/${noteId}/`);
};
