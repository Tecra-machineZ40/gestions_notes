/**
 * Instance Axios configurée avec intercepteurs JWT
 * Ajoute automatiquement le token d'accès à chaque requête
 * Gère le rafraîchissement automatique du token si expiré
 */

import axios from "axios";
import * as authService from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ============================================================================
// 🔧 INSTANCE AXIOS
// ============================================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// ➕ INTERCEPTEUR DE REQUÊTE
// ============================================================================

api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'accès s'il existe
    const tokens = authService.getStoredTokens();
    if (tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// ⬅️ INTERCEPTEUR DE RÉPONSE
// ============================================================================

let isRefreshing = false;
let failedQueue = [];

const tryRestoreAdminSession = () => {
  const backup = authService.getImpersonationBackup?.();
  if (!backup?.tokens?.access || !backup?.tokens?.refresh || !backup?.user) {
    return false;
  }

  authService.storeTokens(backup.tokens.access, backup.tokens.refresh);
  authService.storeUser(backup.user);
  authService.clearImpersonationBackup();
  window.location.href = "/dashboard";
  return true;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas encore en rafraîchissement
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;

      const tokens = authService.getStoredTokens();

      if (tokens.refresh) {
        try {
          // Essayer de rafraîchir le token
          const { access } = await authService.refreshAccessToken(tokens.refresh);

          // Stocker le nouveau token
          authService.storeTokens(access, tokens.refresh);

          // Mettre à jour la config de la requête originale
          originalRequest.headers.Authorization = `Bearer ${access}`;

          // Retraiter la queue de requêtes échouées
          processQueue(null, access);

          // Relancer la requête originale
          return api(originalRequest);
        } catch (refreshError) {
          // Rafraîchissement échoué: si impersonation active, restaurer la session admin.
          if (!tryRestoreAdminSession()) {
            authService.clearTokens();
            window.location.href = "/login";
          }
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token
        if (!tryRestoreAdminSession()) {
          authService.clearTokens();
          window.location.href = "/login";
        }
        isRefreshing = false;
        return Promise.reject(error);
      }
    }

    // Si on est déjà en train de rafraîchir, ajouter à la queue
    if (error.response?.status === 401 && isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
    }

    return Promise.reject(error);
  }
);

export default api;
