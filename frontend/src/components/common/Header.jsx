import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Header.css';

/**
 * Header - Barre d'en-tête avec profil et notifications
 */
const Header = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'Note mise à jour', time: '5 min' },
    { id: 2, message: 'Nouvelle UE disponible', time: '1 h' },
    { id: 3, message: 'Résultats publiés', time: '2 h' },
  ]);

  return (
    <header className="header">
      <div className="header-content">
        {/* Espace vide pour équilibre */}
        <div className="header-left"></div>

        {/* Contenu central */}
        <div className="header-center">
          <h2>Bienvenue, {user?.name || 'Utilisateur'}</h2>
        </div>

        {/* Partie droite : Notifications et Profil */}
        <div className="header-right">
          {/* Notifications */}
          <div className="notification-container">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              🔔
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">Notifications</div>
                {notifications.map((notif) => (
                  <div key={notif.id} className="notification-item">
                    <p>{notif.message}</p>
                    <span className="notification-time">{notif.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profil */}
          <div className="profile-container">
            <div className="avatar">{user?.avatar || '👤'}</div>
            <div className="profile-info">
              <p className="profile-name">{user?.name || 'Utilisateur'}</p>
              <p className="profile-role">
                {user?.role === 'student' && 'Étudiant'}
                {user?.role === 'teacher' && 'Enseignant'}
                {user?.role === 'supervisor' && 'Superviseur'}
                {user?.role === 'admin' && 'Administrateur'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
