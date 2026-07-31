/**
 * API_INTEGRATION.md
 * 
 * Guide d'intégration avec l'API Django
 * 
 * Cette application est prête à être connectée à une API Django.
 * Voici comment intégrer les endpoints de votre backend.
 */

/**
 * 1. SERVICE D'AUTHENTIFICATION
 * ============================================
 * 
 * Créer un fichier: src/services/authService.js
 * 
 * Example:
 */

// import axios from 'axios';

// const API_URL = 'http://localhost:8000/api';

// export const authService = {
//   // Login
//   login: async (email, password) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/login/`, {
//         email,
//         password,
//       });
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   // Logout
//   logout: async () => {
//     try {
//       await axios.post(`${API_URL}/auth/logout/`);
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   },

//   // Récupérer le profil utilisateur
//   getCurrentUser: async () => {
//     try {
//       const response = await axios.get(`${API_URL}/auth/me/`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },
// };

/**
 * 2. SERVICE POUR LES NOTES (ÉTUDIANT)
 * ============================================
 */

// export const gradeService = {
//   // Récupérer les notes de l'étudiant
//   getStudentGrades: async (studentId) => {
//     try {
//       const response = await axios.get(`${API_URL}/students/${studentId}/grades/`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   // Moyenne générale de l'étudiant
//   getStudentAverage: async (studentId) => {
//     try {
//       const response = await axios.get(`${API_URL}/students/${studentId}/average/`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },
// };

/**
 * 3. SERVICE POUR LA SAISIE DES NOTES (ENSEIGNANT)
 * ============================================
 */

// export const teacherService = {
//   // Récupérer les étudiants d'une classe
//   getClassStudents: async (courseId) => {
//     try {
//       const response = await axios.get(`${API_URL}/courses/${courseId}/students/`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   // Ajouter une note
//   addGrade: async (studentId, courseId, gradeData) => {
//     try {
//       const response = await axios.post(
//         `${API_URL}/grades/`,
//         {
//           student_id: studentId,
//           course_id: courseId,
//           ...gradeData,
//         }
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   // Modifier une note
//   updateGrade: async (gradeId, gradeData) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/grades/${gradeId}/`,
//         gradeData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },
// };

/**
 * 4. SERVICE POUR LE SUPERVISEUR
 * ============================================
 */

// export const supervisorService = {
//   // Récupérer tous les résultats avec filtres
//   getResults: async (filters = {}) => {
//     try {
//       const params = new URLSearchParams(filters);
//       const response = await axios.get(`${API_URL}/results/?${params}`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   // Récupérer les statistiques par semestre
//   getSemesterStats: async (semesterId) => {
//     try {
//       const response = await axios.get(`${API_URL}/semesters/${semesterId}/stats/`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },
// };

/**
 * 5. SERVICE ADMIN - CRUD
 * ============================================
 */

// export const adminService = {
//   // ÉTUDIANTS
//   getStudents: async () => {
//     try {
//       const response = await axios.get(`${API_URL}/students/`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   addStudent: async (studentData) => {
//     try {
//       const response = await axios.post(`${API_URL}/students/`, studentData);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   updateStudent: async (studentId, studentData) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/students/${studentId}/`,
//         studentData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   deleteStudent: async (studentId) => {
//     try {
//       await axios.delete(`${API_URL}/students/${studentId}/`);
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   // UES (Unités d'Enseignement)
//   getCourses: async () => {
//     try {
//       const response = await axios.get(`${API_URL}/courses/`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   addCourse: async (courseData) => {
//     try {
//       const response = await axios.post(`${API_URL}/courses/`, courseData);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   updateCourse: async (courseId, courseData) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/courses/${courseId}/`,
//         courseData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   deleteCourse: async (courseId) => {
//     try {
//       await axios.delete(`${API_URL}/courses/${courseId}/`);
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   // SEMESTRES
//   getSemesters: async () => {
//     try {
//       const response = await axios.get(`${API_URL}/semesters/`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   addSemester: async (semesterData) => {
//     try {
//       const response = await axios.post(`${API_URL}/semesters/`, semesterData);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   updateSemester: async (semesterId, semesterData) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/semesters/${semesterId}/`,
//         semesterData
//       );
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   deleteSemester: async (semesterId) => {
//     try {
//       await axios.delete(`${API_URL}/semesters/${semesterId}/`);
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   // ANNÉES ACADÉMIQUES
//   getAcademicYears: async () => {
//     try {
//       const response = await axios.get(`${API_URL}/years/`);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   addYear: async (yearData) => {
//     try {
//       const response = await axios.post(`${API_URL}/years/`, yearData);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   updateYear: async (yearId, yearData) => {
//     try {
//       const response = await axios.put(`${API_URL}/years/${yearId}/`, yearData);
//       return response.data;
//     } catch (error) {
//       throw error.response.data;
//     }
//   },

//   deleteYear: async (yearId) => {
//     try {
//       await axios.delete(`${API_URL}/years/${yearId}/`);
//     } catch (error) {
//       throw error.response.data;
//     }
//   },
// };

/**
 * 6. CONFIGURATION AXIOS
 * ============================================
 */

// // Créer une instance axios personnalisée
// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:8000/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Intercepteur pour ajouter le token JWT à chaque requête
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Intercepteur pour gérer les erreurs (token expiré, etc.)
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Rediriger vers la page de login
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

/**
 * 7. EXEMPLE D'UTILISATION DANS UN COMPOSANT
 * ============================================
 */

// import { useEffect, useState } from 'react';
// import { gradeService } from '../services/gradeService';

// function StudentGradesWithAPI() {
//   const [grades, setGrades] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchGrades = async () => {
//       try {
//         setLoading(true);
//         const data = await gradeService.getStudentGrades(user.id);
//         setGrades(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGrades();
//   }, []);

//   if (loading) return <div>Chargement...</div>;
//   if (error) return <div>Erreur: {error}</div>;

//   return <Table columns={...} data={grades} />;
// }

export const API_INTEGRATION_READY = true;
