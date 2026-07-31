import React from 'react';
import '../../styles/Card.css';

/**
 * Card - Composant réutilisable pour afficher des statistiques
 * Props:
 *   - title: Titre de la carte
 *   - value: Valeur principale
 *   - icon: Emoji ou icône
 *   - color: Couleur d'accent ('blue', 'green', 'red', 'purple')
 *   - description: Texte descriptif optionnel
 */
const Card = ({ title, value, icon = '📊', color = 'blue', description }) => {
  return (
    <div className={`card card-${color}`}>
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">
        <p className="card-value">{value}</p>
        {description && <p className="card-description">{description}</p>}
      </div>
    </div>
  );
};

export default Card;
