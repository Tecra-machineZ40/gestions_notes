# 📚 GestionNotes - Application Frontend React

Une application complète de gestion académique construite avec React.js et CSS moderne.

## 🎯 Vue d'ensemble

GestionNotes est une application web moderne pour gérer les notes et résultats académiques selon 4 rôles utilisateur :

- 👨‍🎓 **Étudiant** : Consulter ses notes
- 👨‍🏫 **Enseignant** : Saisir et gérer les notes
- 👨‍💼 **Superviseur** : Visualiser les résultats globaux avec filtres
- 👨‍💻 **Admin** : Gérer étudiants, UE, semestres, années

## 📁 Structure du projet

```
frontend/src/
├── components/
│   ├── common/                    # Composants réutilisables
│   │   ├── Header.jsx            # Barre supérieure
│   │   ├── Sidebar.jsx           # Navigation latérale
│   │   ├── Layout.jsx            # Layout principal
│   │   ├── Card.jsx              # Cartes statistiques
│   │   ├── Table.jsx             # Tableaux de données
│   │   └── Login.jsx             # Page de connexion
│   ├── student/                  # Composants étudiant (futurs)
│   ├── teacher/                  # Composants enseignant (futurs)
│   ├── admin/                    # Composants admin (futurs)
│   └── supervisor/               # Composants superviseur (futurs)
│
├── pages/                         # Pages métier
│   ├── Dashboard.jsx             # Page d'accueil
│   ├── StudentGrades.jsx         # Relevé de notes
│   ├── TeacherGradeEntry.jsx     # Saisie des notes
│   ├── SupervisorResults.jsx     # Résultats superviseur
│   ├── AdminStudents.jsx         # CRUD Étudiants
│   ├── AdminCourses.jsx          # CRUD UE
│   ├── AdminSemesters.jsx        # CRUD Semestres
│   └── AdminYears.jsx            # CRUD Années
│
├── context/
│   └── AuthContext.jsx           # Contexte d'authentification global
│
├── styles/
│   ├── variables.css             # Thème et variables
│   ├── Layout.css
│   ├── Sidebar.css
│   ├── Header.css
│   ├── Card.css
│   ├── Table.css
│   ├── Dashboard.css
│   ├── StudentGrades.css
│   ├── TeacherGradeEntry.css
│   ├── SupervisorResults.css
│   ├── AdminCRUD.css
│   └── Login.css
│
├── App.jsx                       # Composant principal avec routage
├── App.css                       # Styles globaux
├── index.css                     # CSS d'initialisation
└── main.jsx                      # Point d'entrée
```

## 🚀 Démarrage rapide

### Installation

```bash
cd frontend
npm install
```

### Développement

```bash
npm run dev
```

L'application s'ouvre sur `http://localhost:5173`

### Production

```bash
npm run build
npm run preview
```

## 🎨 Design System

### Couleurs principales
- **Bleu primaire** : #3b82f6 (actions principales)
- **Vert succès** : #10b981 (validé)
- **Rouge erreur** : #ef4444 (échoué)
- **Violet info** : #8b5cf6 (informations)

### Composants réutilisables

#### Card
Affiche des statistiques avec icône, titre, valeur
```jsx
<Card 
  title="Moyenne générale"
  value="14.2/20"
  icon="📊"
  color="green"
/>
```

#### Table
Tableau de données avec actions
```jsx
<Table 
  columns={['Nom', 'Email', 'Classe']}
  data={data}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### Layout
Wrapper principal avec Sidebar + Header
```jsx
<Layout currentPage={page} onNavigate={handleNav}>
  {/* Contenu */}
</Layout>
```

## 🔐 Authentification

L'application utilise un **AuthContext** pour gérer l'authentification globale.

### Login de test

Utilisateurs de démonstration disponibles :
- **Étudiant** : ahmed@university.edu
- **Enseignant** : fatima@university.edu
- **Superviseur** : mohamed@university.edu
- **Admin** : admin@university.edu

Mot de passe : n'importe quel mot de passe (démo)

### Utilisation du contexte
```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  return <div>{user?.name}</div>;
}
```

## 📄 Pages principales

### Dashboard
- Cartes avec statistiques (étudiants, moyenne, UE, taux réussite)
- Graphique de tendance de réussite
- Accessible à tous les rôles

### Étudiant - Relevé de Notes
- Tableau interactif des notes par UE
- Codage couleur (vert = validé, rouge = non validé)
- Statistiques personnelles

### Enseignant - Saisie des Notes
- Formulaire pour entrer notes devoir/examen
- Calcul automatique de la moyenne
- Boutons modifier/enregistrer

### Superviseur - Résultats
- Table complète des résultats
- Filtres par semestre, UE, résultat
- Statistiques globales

### Admin - CRUD
4 pages de gestion :
- Étudiants
- UE (Unités d'Enseignement)
- Semestres
- Années académiques

Chaque page permet : créer, modifier, supprimer

## 🔗 Intégration API Django

Voir le fichier `API_INTEGRATION.md` pour :
- Configuration axios
- Endpoints à implémenter
- Exemples de services
- Gestion des tokens JWT

## 📱 Responsive Design

L'application est optimisée pour tous les écrans :

- **Desktop** : Layout complet avec sidebar
- **Tablet** : Sidebar collapsable
- **Mobile** : Sidebar en overlay, tables scrollables

## 🎯 Fonctionnalités principales

✅ Authentification multi-rôles
✅ Routage dynamique selon le rôle
✅ Tableaux interactifs
✅ Formulaires CRUD
✅ Statistiques et graphiques
✅ Design moderne et responsive
✅ Thème cohérent
✅ Transitions fluides
✅ Messages de feedback
✅ Gestion d'erreurs

## 🔧 Technologies utilisées

- **React 18+** : Framework UI
- **CSS3** : Styling (Flexbox, Grid)
- **Context API** : Gestion d'état
- **Vite** : Build tool

## 📚 Ressources

- [React Documentation](https://react.dev)
- [CSS Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

## 📝 Notes de développement

### Ajouter une nouvelle page

1. Créer le fichier dans `/pages/`
2. Importer dans `App.jsx`
3. Ajouter l'entrée dans `pageComponents`
4. Ajouter les permissions dans `isPageAllowedForRole`

### Modifier le thème

Éditer `/styles/variables.css` :
```css
:root {
  --primary-color: #votre-couleur;
  /* ... autres variables */
}
```

### Responsive breakpoints
```css
/* Tablet */
@media (max-width: 768px) { }

/* Mobile */
@media (max-width: 480px) { }
```

## 🐛 Débogage

Ouvrir les outils de développement :
- F12 ou Cmd+Option+I (Mac)
- Inspectez les états React dans React DevTools

## ✨ Prochaines étapes

- [ ] Connecter à l'API Django
- [ ] Ajouter validation côté client
- [ ] Implémenter le dark mode
- [ ] Ajouter des tests (Jest, React Testing Library)
- [ ] Optimiser les performances
- [ ] Ajouter des animations avancées

## 📄 Licence

MIT

---

**Créé avec ❤️ pour la gestion académique**
