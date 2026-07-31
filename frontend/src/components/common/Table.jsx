import React from 'react';
import '../../styles/Table.css';

/**
 * Table - Composant réutilisable pour afficher des données tabulaires
 * Props:
 *   - columns: Array de noms de colonnes
 *   - data: Array d'objets contenant les données
 *   - onEdit: Callback pour éditer une ligne
 *   - onDelete: Callback pour supprimer une ligne
 *   - highlighted: Array d'index de lignes à surligner
 */
const Table = ({ columns, data, onEdit, onDelete, highlighted = [] }) => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={highlighted.includes(index) ? 'highlighted' : ''}
            >
              {columns.map((column) => (
                <td key={`${index}-${column}`}>{row[column]}</td>
              ))}
              {(onEdit || onDelete) && (
                <td className="actions-cell">
                  {onEdit && (
                    <button className="btn-action edit" onClick={() => onEdit(index)}>
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button className="btn-action delete" onClick={() => onDelete(index)}>
                      🗑️
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
