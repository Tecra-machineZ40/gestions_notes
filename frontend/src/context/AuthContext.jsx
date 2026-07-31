/**
 * Contexte d'authentification global
 * Gère l'utilisateur connecté, les tokens JWT et les permissions
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../api/authService';
import { impersonateUser } from '../api/userService';

// Créer le contexte
const AuthContext = createContext(null);

// ============================================================================
// 🔐 PROVIDER AUTHENTIFICATION
// ============================================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [impersonationInfo, setImpersonationInfo] = useState(null);

  // ===== Initialisation - Récupérer l'utilisateur du localStorage =====
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = authService.getStoredTokens();
        const storedUser = authService.getStoredUser();

        if (tokens.access && storedUser) {
          try {
            const currentUser = await authService.getCurrentUser(tokens.access);
            setUser(currentUser);
            authService.storeUser(currentUser);

            const backup = authService.getImpersonationBackup();
            if (backup) {
              setImpersonationInfo({
                active: true,
                admin: backup.user,
                target: currentUser,
              });
            }
          } catch (refreshError) {
            console.warn('⚠️ Impossible de rafraîchir /me, utilisation du cache local:', refreshError);
            setUser(storedUser);
            const backup = authService.getImpersonationBackup();
            if (backup) {
              setImpersonationInfo({
                active: true,
                admin: backup.user,
                target: storedUser,
              });
            }
          }
        }
      } catch (err) {
        console.error('❌ Erreur initialisation auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ===== Connexion =====
  const login = async (username, password) => {
    try {
      setError(null);
      setIsLoading(true);

      // Appeler le service de login
      const { access, refresh, user: userData } = await authService.login(
        username,
        password
      );

      // Stocker les tokens et utilisateur
      authService.storeTokens(access, refresh);
      authService.storeUser(userData);

      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage =
        err.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Déconnexion =====
  const logout = async () => {
    try {
      await authService.logout();
      authService.clearTokens();
      authService.clearImpersonationBackup();
      setUser(null);
      setImpersonationInfo(null);
      setError(null);
    } catch (err) {
      console.error('❌ Erreur déconnexion:', err);
    }
  };

  // ===== Vérifier les permissions =====
  const hasPermission = (requiredRoles) => {
    if (!user) return false;
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    return requiredRoles.includes(user.role);
  };

  // ===== Vérifier si connecté =====
  const isAuthenticated = () => {
    return !!user && !!authService.getStoredTokens().access;
  };

  // ===== Vérifier le rôle =====
  const hasRole = (role) => user?.role === role;

  const startImpersonation = async (targetUserId) => {
    if (!user || !['admin', 'administrateur'].includes(user.role)) {
      throw new Error('Seul un administrateur peut lancer une impersonation.');
    }

    const currentTokens = authService.getStoredTokens();
    const currentUser = authService.getStoredUser();

    if (!currentTokens?.access || !currentTokens?.refresh || !currentUser) {
      throw new Error('Session administrateur invalide.');
    }

    const response = await impersonateUser(targetUserId);
    authService.storeImpersonationBackup({
      tokens: currentTokens,
      user: currentUser,
      startedAt: new Date().toISOString(),
    });

    authService.storeTokens(response.access, response.refresh);
    authService.storeUser(response.user);
    setUser(response.user);
    setImpersonationInfo({
      active: true,
      admin: currentUser,
      target: response.user,
      metadata: response.impersonation,
    });

    return response;
  };

  const stopImpersonation = async () => {
    const backup = authService.getImpersonationBackup();
    if (!backup?.tokens?.access || !backup?.tokens?.refresh || !backup?.user) {
      throw new Error('Aucune session d\'impersonation active.');
    }

    authService.storeTokens(backup.tokens.access, backup.tokens.refresh);
    authService.storeUser(backup.user);
    authService.clearImpersonationBackup();
    setUser(backup.user);
    setImpersonationInfo(null);
  };

  // ===== Valeur du contexte =====
  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
    isAuthenticated,
    hasRole,
    impersonationInfo,
    isImpersonating: !!impersonationInfo?.active,
    startImpersonation,
    stopImpersonation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// 🎣 HOOK D'UTILISATION
// ============================================================================

/**
 * Hook pour accéder au contexte d'authentification
 * Usage: const auth = useAuth();
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};
