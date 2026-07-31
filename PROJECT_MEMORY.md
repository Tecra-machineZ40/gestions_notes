# Memoire Projet

## Nom
- Projet: `gestions_notes`
- Stack principale:
  - Frontend: React + Vite
  - Backend: Django + Django REST Framework + JWT

## Architecture actuelle
- Le frontend actif est dans `frontend/src`.
- Le backend actif est dans `backend/`.
- Le dashboard principal passe par:
  - `frontend/src/App.jsx`
  - `frontend/src/components/UnifiedDashboard.jsx`
  - `frontend/src/components/dashboard/DashboardContent.jsx`
  - `frontend/src/components/dashboard/DashboardViews.jsx`

## Decision importante
- L'ancienne architecture basée sur `frontend/src/pages` a ete supprimee.
- Les anciens composants dashboard mockes ont ete supprimes.
- La nouvelle source de verite du dashboard est `DashboardViews.jsx`.

## Pages publiques frontend
- `/login`
- `/signup`
- `/activate-account`

## Dashboard par role
- `admin`
  - dashboard
  - users
  - students
  - courses
  - semesters
  - years
  - grades
  - statistics
  - reports
- `teacher`
  - dashboard
  - grade-entry
  - my-classes
  - my-students
  - evaluations
  - my-stats
- `student`
  - dashboard
  - my-grades
  - my-average
  - history
  - profile
- `supervisor`
  - dashboard
  - validate-grades
  - supervise-teachers
  - all-students
  - all-teachers
  - detailed-reports
  - performance

## Services API utilises cote frontend
- `frontend/src/api/authService.js`
- `frontend/src/api/axios.js`
- `frontend/src/api/academicService.js`
- `frontend/src/api/studentService.js`
- `frontend/src/api/gradeService.js`
- `frontend/src/api/userService.js`

## Endpoints backend confirmes
- `/api/me/`
- `/api/register/`
- `/api/activate-account/`
- `/api/token/`
- `/api/token/refresh/`
- `/api/utilisateurs/`
- `/api/etudiants/`
- `/api/etudiants/mon_profil/`
- `/api/etudiants/mes_notes/`
- `/api/annees-academiques/`
- `/api/semestres/`
- `/api/ues/`
- `/api/sessions/`
- `/api/matieres/`
- `/api/matieres/statistiques/`
- `/api/matieres/calculer_moyennes/`

## Fichiers importants modifies recemment
- `frontend/src/App.jsx`
- `frontend/src/components/UnifiedDashboard.jsx`
- `frontend/src/components/common/Layout.jsx`
- `frontend/src/components/dashboard/DashboardContent.jsx`
- `frontend/src/components/dashboard/DashboardViews.jsx`
- `frontend/src/api/userService.js`

## Blocages connus
- Verification frontend par `node`, `vite build` ou `eslint` bloquee dans cet environnement Windows:
  - erreur `EPERM`
  - erreur sur `lstat 'C:\\Users\\TOCHIBA Z40 B'`
- Verification Django bloquee si la variable d'environnement `DEBUG` vaut `release`:
  - `python-decouple` attend un booleen valide

## Resultat de verification du 23 avril 2026
- Backend:
  - `manage.py check` passe avec `DEBUG=True`
  - authentification JWT verifiee avec succes
  - endpoints verifies en `200`:
    - `/api/token/`
    - `/api/me/`
    - `/api/utilisateurs/`
    - `/api/etudiants/`
    - `/api/annees-academiques/`
    - `/api/semestres/`
    - `/api/ues/`
    - `/api/sessions/`
    - `/api/matieres/`
- Frontend:
  - `vite build` passe
  - `eslint` ne remonte plus d'erreurs bloquantes
  - il reste 2 warnings non bloquants dans `frontend/src/components/dashboard/DashboardViews.jsx`

## Corrections finales du 25 avril 2026
- Incompatibilite de roles frontend/backend corrigee:
  - backend: `enseignant`, `etudiant`, `superviseur`, `admin`
  - frontend: normalisation vers `teacher`, `student`, `supervisor`, `admin`
- Creation de note backend corrigee:
  - calcul de moyenne passe en `Decimal`
  - le flux `enseignant -> creation note -> superviseur -> etudiant` fonctionne
- Les scripts racine `backend/test_*.py` ont ete nettoyes pour ne plus casser `manage.py test` a l'import
- Frontend:
  - `vite build` passe toujours
  - `eslint` ne remonte plus d'erreur ni de warning

## Probleme encore ouverts apres verification
- La suite `manage.py test` globale echoue, mais a cause de scripts de test annexes dans `backend/`:
  - `test_action.py`
  - `test_admin.py`
  - `test_api.py`
  - `test_email.py`
- Ces echecs ne prouvent pas un probleme du coeur de l'application, mais montrent que la suite de tests du repo n'est pas propre.
- La verification de base du backend est stable: `DEBUG=release` ne casse plus la validation de configuration dans l’environnement teste.
- Vite affiche un avertissement de version Node:
  - version detectee: `20.13.1`
  - version recommandee par Vite: `20.19+`

## Points a tester manuellement
- Login reel avec JWT
- Redirection apres connexion
- Chargement des vues par role
- Recuperation des listes:
  - utilisateurs
  - etudiants
  - UE
  - semestres
  - annees
  - sessions
  - notes
- Creation de note depuis la vue enseignant
- Recalcul des moyennes depuis la vue superviseur

## Risques restants
- Certaines vues supposent que les permissions backend permettent l'acces selon le role connecte.
- Certains libelles ou mappings peuvent devoir etre ajustes selon les vraies reponses JSON du backend.
- Le style du frontend utilise beaucoup de classes utilitaires; verifier si Tailwind est reellement configure dans le projet.
- La navigation compile et les pages sont reliees, mais un test visuel complet role par role dans le navigateur reste recommande.

## Prochaines priorites conseillees
1. Corriger proprement la gestion de `DEBUG` dans la configuration backend.
2. Reparer ou retirer les scripts de tests backend cassés.
3. Tester chaque role avec de vrais comptes dans le navigateur.
4. Ajuster les vues selon les permissions reelles et les vraies reponses API.
5. Lever les 2 warnings restants dans `DashboardViews.jsx`.

## Audit operationnel du 29 mai 2026
- Verifications backend:
  - `python backend/manage.py check --settings=backend.settings` reussit (`System check identified no issues (0 silenced)`).
  - La configuration `DEBUG` est robuste dans `backend/backend/settings.py` grace au fallback manuel `python-decouple`/`.env` ; une valeur non booleenne comme `release` ne casse plus la verification de base.
- Verifications frontend:
  - `npm run build` reussit dans `frontend/`.
  - `npm run lint` termine sans erreur.
  - Vite continue a afficher un avertissement d’environnement Node: la version installée `20.13.1` est inferieure a la version recommandee `20.19+`/`22.12+`, mais la compilation reste fonctionnelle.
- Audit de securite frontend:
  - `npm audit --audit-level=high` remonte 2 vulnerabilites connues:
    - `axios` (haute severite)
    - `postcss` (moderee)
  - Une remediation par `npm audit fix` est recommandee.
- Etat repository:
  - L’execution de `git` n’est pas disponible dans le shell de verification courant, donc l’audit s’appuie sur les commandes de validation disponibles et l’inspection des fichiers du projet.
- Risques persistants:
  - Les scripts de test backend a la racine `backend/` restent hors du flux Django standard (`notes/tests.py` est vide).
  - Le front compile, mais la securite de dependances et la compatibilite Node doivent etre traquees regulierement.
