# Dashboard Unifié - Application de Gestion des Notes

## Vue d'ensemble

Le dashboard unifié est une interface dynamique qui s'adapte automatiquement selon le rôle de l'utilisateur connecté. Il remplace les anciens dashboards spécifiques par rôle et offre une expérience cohérente et professionnelle.

## Structure

### Architecture
- **UnifiedDashboard.jsx** : Composant principal du dashboard
- **DashboardContent.jsx** : Gestionnaire de contenu dynamique
- **DashboardOverview.jsx** : Page d'accueil avec statistiques
- **DashboardComponents.jsx** : Composants pour chaque section
- **Dashboard.css** : Styles spécifiques au dashboard

### Navigation
Le menu latéral s'adapte dynamiquement selon le rôle :
- **Admin** : Utilisateurs, Étudiants, Cours, Semestres, Années, Notes, Statistiques, Rapports
- **Enseignant** : Saisir Notes, Mes Classes, Mes Étudiants, Évaluations, Mes Statistiques
- **Étudiant** : Mes Notes, Mes Moyennes, Historique, Profil
- **Superviseur** : Valider Notes, Superviser, Tous Étudiants, Tous Enseignants, Rapports Détaillés, Performances

## Fonctionnalités Implémentées

### ✅ Fonctionnel
1. **DashboardOverview** : Aperçu avec statistiques selon le rôle
2. **UsersManagement** : Gestion complète des utilisateurs (Admin)
3. **GradeEntry** : Saisie des notes (Enseignant)
4. **StudentGrades** : Consultation des notes (Étudiant)

### 🚧 En Développement
- Gestion des étudiants (Admin)
- Gestion des cours/matières (Admin)
- Gestion des semestres (Admin)
- Gestion des années académiques (Admin)
- Statistiques détaillées
- Rapports
- Validation des notes (Superviseur)
- Supervision des enseignants (Superviseur)

## Utilisation

### Connexion
1. Accédez à `http://localhost:5173/login`
2. Connectez-vous avec vos identifiants
3. Le dashboard s'adapte automatiquement à votre rôle

### Navigation
- Utilisez le menu latéral pour naviguer entre les sections
- Chaque section affiche uniquement les fonctionnalités autorisées pour votre rôle
- L'interface est responsive et fonctionne sur mobile

## Personnalisation

### Ajouter une Nouvelle Section
1. Créer le composant dans `/components/dashboard/`
2. L'ajouter aux imports dans `DashboardContent.jsx`
3. L'ajouter au rendu conditionnel selon le rôle
4. Mettre à jour la navigation dans `UnifiedDashboard.jsx`

### Modifier les Styles
- Les styles principaux sont dans `Dashboard.css`
- Utilise Tailwind CSS pour la cohérence
- Design professionnel : fond blanc, bordures bleues, angles carrés

## Rôles et Permissions

### Administrateur
- Gestion complète du système
- CRUD sur tous les utilisateurs
- Validation des comptes étudiants
- Accès à toutes les statistiques

### Enseignant
- Saisie et modification des notes
- Consultation de ses classes et étudiants
- Gestion des évaluations
- Statistiques personnelles

### Étudiant
- Consultation de ses notes
- Calcul automatique des moyennes
- Historique des performances
- Profil académique

### Superviseur
- Validation des notes enseignants
- Supervision des performances
- Rapports détaillés
- Monitoring global

## API Integration

Le dashboard est prêt pour l'intégration API Django :
- Utilise les services existants (`authService.js`, `noteService.js`)
- Endpoints déjà configurés côté backend
- Gestion d'état avec React hooks
- Gestion des erreurs et loading states

## Développement

### Scripts Disponibles
```bash
npm run dev    # Démarre le serveur de développement
npm run build  # Build pour la production
npm run preview # Prévisualisation du build
```

### Technologies
- **React 18** avec hooks
- **Tailwind CSS** pour le styling
- **Axios** pour les appels API
- **React Router** pour la navigation
- **Context API** pour la gestion d'état globale

## Maintenance

### Structure des Fichiers
```
frontend/src/components/
├── UnifiedDashboard.jsx          # Dashboard principal
├── dashboard/
│   ├── DashboardContent.jsx      # Routeur de contenu
│   ├── DashboardOverview.jsx     # Page d'accueil
│   ├── UsersManagement.jsx       # Gestion utilisateurs
│   ├── GradeEntry.jsx           # Saisie notes
│   ├── StudentGrades.jsx        # Notes étudiant
│   ├── DashboardComponents.jsx  # Composants secondaires
│   └── Dashboard.css            # Styles
```

### Bonnes Pratiques
- Composants séparés et réutilisables
- Gestion d'état locale avec `useState`
- Props drilling minimal
- Code scalable et maintenable
- Responsive design first

## Support

Pour toute question ou problème :
1. Vérifier la console du navigateur pour les erreurs
2. Consulter les logs du serveur Django
3. Vérifier les permissions utilisateur
4. Tester avec différents rôles

---

*Dashboard créé pour l'application "Gestions Notes" - Université*