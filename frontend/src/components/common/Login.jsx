import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Login.css';

/**
 * Login - Page de connexion avec sélection de rôle
 */
const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Données de test pour chaque rôle
  const testUsers = {
    student: {
      id: 1,
      name: 'Ahmed Benali',
      email: 'ahmed@university.edu',
      role: 'student',
      avatar: '👨‍🎓',
    },
    teacher: {
      id: 2,
      name: 'Dr. Fatima Zahra',
      email: 'fatima@university.edu',
      role: 'teacher',
      avatar: '👨‍🏫',
    },
    supervisor: {
      id: 3,
      name: 'Prof. Mohamed Saidane',
      email: 'mohamed@university.edu',
      role: 'supervisor',
      avatar: '👨‍💼',
    },
    admin: {
      id: 4,
      name: 'Admin System',
      email: 'admin@university.edu',
      role: 'admin',
      avatar: '👨‍💻',
    },
  };

  /**
   * Gérer la connexion
   */
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation simple
    if (!email || !password) {
      setError('Email et mot de passe requis');
      setIsLoading(false);
      return;
    }

    // Simuler une requête API (3 secondes)
    setTimeout(() => {
      // Pour la démo, on accepte n'importe quel email/mot de passe
      const user = testUsers[selectedRole];
      login(user);
      setIsLoading(false);
      onLoginSuccess();
    }, 1500);
  };

  /**
   * Connexion rapide avec un rôle
   */
  const handleQuickLogin = (role) => {
    const user = testUsers[role];
    login(user);
    onLoginSuccess();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <h1>📚 GestionNotes</h1>
          <p>Système de gestion académique</p>
        </div>

        {/* Formulaire de connexion */}
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Connexion</h2>

          {/* Message d'erreur */}
          {error && <div className="error-message">{error}</div>}

          {/* Sélection du rôle */}
          <div className="role-selection">
            <label>Rôle :</label>
            <div className="role-options">
              {['student', 'teacher', 'supervisor', 'admin'].map((role) => (
                <label key={role} className="role-label">
                  <input
                    type="radio"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                  <span>
                    {role === 'student' && '👨‍🎓 Étudiant'}
                    {role === 'teacher' && '👨‍🏫 Enseignant'}
                    {role === 'supervisor' && '👨‍💼 Superviseur'}
                    {role === 'admin' && '👨‍💻 Admin'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email :</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
            />
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label htmlFor="password">Mot de passe :</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Bouton de connexion */}
          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? '⏳ Connexion...' : '🚀 Se connecter'}
          </button>
        </form>

        {/* Connexion rapide */}
        <div className="quick-login">
          <p className="divider">Ou essayer rapidement</p>
          <div className="quick-buttons">
            {['student', 'teacher', 'supervisor', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                className="btn-quick"
                onClick={() => handleQuickLogin(role)}
              >
                {role === 'student' && '👨‍🎓 Étudiant'}
                {role === 'teacher' && '👨‍🏫 Enseignant'}
                {role === 'supervisor' && '👨‍💼 Superviseur'}
                {role === 'admin' && '👨‍💻 Admin'}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>Démo version - Pour tester l'application</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
