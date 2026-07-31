# Memoire Projet Avant Refactor Dashboard

## Contexte
- Ce fichier decrit l'etat du projet avant les corrections lancees apres le prompt:
  - `fais un resume du projet de ce qui fonctionne comme page et ce qui ne fonctionne pas`
- Il sert de point de reference pour comparer l'ancienne structure et la structure actuelle.

## Etat general avant corrections
- Le projet etait deja separe en:
  - `frontend/` pour React
  - `backend/` pour Django
- Le frontend avait une architecture melangee:
  - une ancienne logique dans `frontend/src/pages`
  - une nouvelle logique dans `frontend/src/components`, `context`, `api`
- Le dashboard avait une interface visible, mais une grande partie etait incomplete ou branchee sur des donnees fictives.

## Pages frontend qui existaient avant corrections

### Pages publiques
- `login`
- `signup`
- `activate-account`

### Pages/dashboard historiques presentes dans `frontend/src/pages`
- `AdminCourses.jsx`
- `AdminDashboard.jsx`
- `AdminSemesters.jsx`
- `AdminStudents.jsx`
- `AdminYears.jsx`
- `Dashboard.jsx`
- `StudentDashboard.jsx`
- `StudentGrades.jsx`
- `StudentGrades_INTÉGRÉ.jsx`
- `SupervisorDashboard.jsx`
- `SupervisorResults.jsx`
- `TeacherDashboard.jsx`
- `TeacherGradeEntry.jsx`

## Probleme principal avant corrections
- Les anciennes pages dans `frontend/src/pages` existaient encore mais n'etaient plus la vraie architecture active.
- Le dashboard visible passait plutot par:
  - `frontend/src/App.jsx`
  - `frontend/src/components/UnifiedDashboard.jsx`
  - `frontend/src/components/dashboard/DashboardContent.jsx`
- Il y avait donc deux structures concurrentes dans le frontend.

## Fonctionnement avant corrections

### Ce qui semblait fonctionner
- La page de connexion etait presente.
- La page d'inscription etait presente.
- La page d'activation de compte etait presente.
- L'authentification utilisait deja:
  - `frontend/src/context/AuthContext.jsx`
  - `frontend/src/api/authService.js`
  - `frontend/src/api/axios.js`
- Le backend exposait deja les routes utiles:
  - `/api/token/`
  - `/api/token/refresh/`
  - `/api/me/`
  - `/api/register/`
  - `/api/activate-account/`
  - endpoints CRUD DRF pour utilisateurs, etudiants, annees, semestres, UE, sessions, matieres

### Ce qui ne fonctionnait pas bien
- Le dashboard unifie affichait des entrees de menu par role, mais beaucoup n'etaient pas reliees a un vrai contenu.
- `DashboardContent.jsx` utilisait des `mockData`.
- Plusieurs sections affichaient en pratique:
  - des tableaux factices
  - des statistiques factices
  - des placeholders
  - ou `Page non trouvée`
- Des composants dashboard dedies existaient mais utilisaient aussi des simulations:
  - `DashboardOverview.jsx`
  - `GradeEntry.jsx`
  - `StudentGrades.jsx`
  - `UsersManagement.jsx`
  - `DashboardComponents.jsx`

## Menu par role avant corrections

### Admin
- dashboard
- users
- students
- courses
- semesters
- years
- grades
- statistics
- reports

### Teacher
- grade-entry
- my-classes
- my-students
- evaluations
- my-stats

### Student
- my-grades
- my-average
- history
- profile

### Supervisor
- validate-grades
- supervise-teachers
- all-students
- all-teachers
- detailed-reports
- performance

## Probleme de liaison avant corrections
- Les items du menu existaient dans `UnifiedDashboard.jsx`.
- Mais le rendu interne dans `DashboardContent.jsx` ne couvrait pas correctement toutes ces entrees.
- Donc plusieurs clics ouvraient une page vide, une page de secours, ou un contenu non metier.

## Incoherences techniques avant corrections
- `frontend/src/main.jsx` utilisait encore `BrowserRouter`.
- `frontend/src/App.jsx` n'utilisait plus reellement React Router pour les pages metier et lisait plutot `window.location.pathname`.
- Il y avait donc une coexistence partielle entre ancienne logique de routage et nouvelle logique.
- `Layout.jsx` contenait une structure dupliquee/cassee.
- Il y avait des imports et composants redondants dans le dashboard.

## Source de donnees avant corrections

### Services existants
- `frontend/src/api/authService.js`
- `frontend/src/api/axios.js`
- `frontend/src/api/academicService.js`
- `frontend/src/api/studentService.js`
- `frontend/src/api/gradeService.js`
- `frontend/src/services/authService.js`
- `frontend/src/services/noteService.js`

### Probleme
- Deux familles de services coexistaient:
  - `src/api/*`
  - `src/services/*`
- La famille `src/api/*` etait plus coherente avec les endpoints Django existants.
- La famille `src/services/*` contenait des appels vers des endpoints incertains ou incoherents.

## Blocages detectes avant corrections
- Build frontend impossible dans l'environnement courant:
  - erreur `EPERM`
  - `lstat 'C:\\Users\\TOCHIBA Z40 B'`
- Verification Django bloquee par configuration `.env`:
  - `DEBUG=release`
  - `python-decouple` attendait un booleen valide

## Conclusion avant corrections
- Le projet etait partiellement fonctionnel pour les pages publiques.
- Le dashboard etait visible mais pas encore vraiment operationnel.
- Les pages metier par role existaient soit:
  - en maquettes,
  - en composants non relies,
  - en anciennes pages non integrees,
  - en code duplique.

## Intention de refactor a partir de ce point
- Relier chaque entree du menu a un vrai composant.
- Remplacer les `mockData` par de vrais appels API.
- Supprimer ou reintegrer proprement l'ancien dossier `frontend/src/pages`.
