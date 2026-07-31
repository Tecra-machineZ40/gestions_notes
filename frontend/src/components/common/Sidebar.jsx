import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Sidebar.css';

/**
 * Sidebar - Composant de navigation principal
 * Affiche le menu différent selon le rôle de l'utilisateur
 */
const Sidebar = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Définir les éléments du menu selon le rôle
  const getMenuItems = () => {
    const baseMenu = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'notes', label: 'Notes', icon: '📝' },
    ];

    const roleMenus = {
      student: [...baseMenu, { id: 'grades', label: 'Relevé de notes', icon: '📋' }],
      teacher: [
        ...baseMenu,
        { id: 'grade-entry', label: 'Saisie des notes', icon: '✏️' },
      ],
      supervisor: [
        ...baseMenu,
        { id: 'results', label: 'Résultats', icon: '📊' },
        { id: 'filters', label: 'Filtres', icon: '🔍' },
      ],
      admin: [
        ...baseMenu,
        { id: 'students', label: 'Étudiants', icon: '👥' },
        { id: 'courses', label: 'UE', icon: '📚' },
        { id: 'semesters', label: 'Semestres', icon: '📅' },
        { id: 'years', label: 'Années', icon: '📆' },
      ],
    };

    return roleMenus[user?.role] || baseMenu;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header Sidebar */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">{isCollapsed ? '📚' : '📚 GestionNotes'}</h1>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer Sidebar */}
      <div className="sidebar-footer">
        <button
          className="nav-item logout-btn"
          onClick={logout}
          title="Déconnexion"
        >
          <span className="nav-icon">🚪</span>
          {!isCollapsed && <span className="nav-label">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
