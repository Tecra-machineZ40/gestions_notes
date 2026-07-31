/**
 * Service d'authentification - Gestion des tokens JWT
 * Connecté à l'API Django: /api/token/, /api/token/refresh/
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Instance axios pour l'authentification
const authClient = axios.create({
  baseURL: API_BASE_URL,
});

// ============================================================================
// 🔐 AUTHENTIFICATION
// ============================================================================

/**
 * Connexion utilisateur - Obtient les tokens JWT
 * @param {string} username - Email ou username
 * @param {string} password - Mot de passe
 * @returns {Promise} { access, refresh, user_info }
 */
export const login = async (username, password) => {
  try {
    const response = await authClient.post('/token/', {
      username,
      password,
    });

    const { access, refresh } = response.data;

    // Récupérer les infos utilisateur
    const userResponse = await getCurrentUser(access);

    return {
      access,
      refresh,
      user: userResponse,
    };
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    throw {
      message: error.response?.data?.detail || 'Identifiants incorrects',
      code: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Rafraîchir le token d'accès
 * @param {string} refreshToken - Token de rafraîchissement
 * @returns {Promise} { access }
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await authClient.post('/token/refresh/', {
      refresh: refreshToken,
    });

    return response.data;
  } catch (error) {
    console.error('❌ Erreur de rafraîchissement:', error.response?.data);
    // Le refresh token a expiré - redirection vers login nécessaire
    throw {
      message: 'Session expirée',
      code: 'TOKEN_EXPIRED',
    };
  }
};

/**
 * Récupère l'utilisateur actuellement connecté
 * @param {string} accessToken - Token d'accès JWT
 * @returns {Promise} { id, username, email, role, is_superuser }
 */
export const getCurrentUser = async (accessToken) => {
  try {
    const response = await authClient.get('/me/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error.response?.data);
    throw {
      message: 'Impossible de récupérer les infos utilisateur',
      code: error.response?.status,
    };
  }
};

/**
 * Déconnexion
 * Note: JWT ne nécessite pas logout côté serveur, juste suppression des tokens côté client
 */
export const logout = () => {
  // Les tokens sont supprimés par le contexte
  return Promise.resolve();
};

// ============================================================================
// 📝 INSCRIPTION
// ============================================================================

/**
 * Inscription d'un nouvel utilisateur (étudiant)
 * @param {Object} data - Données d'inscription
 * @returns {Promise} Réponse serveur
 */
export const register = async (data) => {
  try {
    const response = await authClient.post('/register/', data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur inscription:', error.response?.data || error.message);
    // Erreur réseau (backend non joignable)
    if (!error.response || error.code === 'ERR_NETWORK') {
      throw {
        message: 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.',
        code: 'NETWORK_ERROR',
        details: null,
      };
    }
    throw {
      message: error.response?.data?.detail || 'Erreur lors de l\'inscription',
      code: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Activation de compte avec code
 * @param {Object} data - { username, password, code_inscription }
 * @returns {Promise} Réponse serveur
 */
export const activateAccount = async (data) => {
  try {
    const response = await authClient.post('/activate-account/', data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur activation:', error.response?.data || error.message);
    if (!error.response || error.code === 'ERR_NETWORK') {
      throw {
        message: 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.',
        code: 'NETWORK_ERROR',
        details: null,
      };
    }

    const details = error.response?.data;
    let message = details?.detail || 'Code d\'activation invalide';

    if (details?.username?.length) {
      message = details.username[0];
    } else if (details?.password?.length) {
      message = details.password[0];
    } else if (details?.code_inscription?.length) {
      message = details.code_inscription[0];
    } else if (details?.non_field_errors?.length) {
      message = details.non_field_errors[0];
    }

    throw {
      message,
      code: error.response?.status,
      details,
    };
  }
};

/**
 * Demande de réinitialisation de mot de passe
 * @param {string} identifier - Email ou nom d'utilisateur
 */
export const requestPasswordReset = async (identifier) => {
  try {
    const response = await authClient.post('/password-reset/request/', { identifier });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur demande réinitialisation:', error.response?.data || error.message);
    throw {
      message: error.response?.data?.detail || 'Impossible d\'envoyer la demande de réinitialisation',
      code: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Confirmation de réinitialisation de mot de passe
 * @param {Object} data - { uid, token, new_password }
 */
export const confirmPasswordReset = async (data) => {
  try {
    const response = await authClient.post('/password-reset/confirm/', data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur confirmation réinitialisation:', error.response?.data || error.message);
    const detail = error.response?.data?.detail || 'Lien invalide ou expiré';
    const debug = error.response?.data?.debug;
    const debugSuffix = debug ? ` (${JSON.stringify(debug)})` : '';
    throw {
      message: `${detail}${debugSuffix}`,
      code: error.response?.status,
      details: error.response?.data,
    };
  }
};

// ============================================================================
// 🛠️ UTILITAIRES
// ============================================================================

/**
 * Stocke les tokens dans localStorage
 */
export const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

/**
 * Récupère les tokens du localStorage
 */
export const getStoredTokens = () => {
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  };
};

/**
 * Supprime les tokens du localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('impersonation_backup');
};

/**
 * Stocke l'utilisateur
 */
export const storeUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Récupère l'utilisateur du localStorage
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const storeImpersonationBackup = (backup) => {
  localStorage.setItem('impersonation_backup', JSON.stringify(backup));
};

export const getImpersonationBackup = () => {
  const value = localStorage.getItem('impersonation_backup');
  return value ? JSON.parse(value) : null;
};

export const clearImpersonationBackup = () => {
  localStorage.removeItem('impersonation_backup');
};

export const isImpersonating = () => {
  return !!getImpersonationBackup();
};

export default {
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  register,
  activateAccount,
  requestPasswordReset,
  confirmPasswordReset,
  storeTokens,
  getStoredTokens,
  clearTokens,
  storeUser,
  getStoredUser,
  storeImpersonationBackup,
  getImpersonationBackup,
  clearImpersonationBackup,
  isImpersonating,
};
