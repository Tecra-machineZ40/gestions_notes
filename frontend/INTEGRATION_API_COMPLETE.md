# 🔌 GUIDE COMPLET D'INTÉGRATION API

## ✅ INTÉGRATION RÉALISÉE

Vous avez maintenant une **intégration complète et fonctionnelle** entre le frontend React et l'API Django!

---

## 📊 CE QUI A ÉTÉ FAIT

### 1️⃣ **Services Axios créés** ✅

#### ✨ authService.js
- ✅ `login(username, password)` - Connexion JWT
- ✅ `refreshAccessToken(refreshToken)` - Rafraîchissement automatique
- ✅ `getCurrentUser(token)` - Récupère l'utilisateur courant
- ✅ `logout()` - Déconnexion
- ✅ `register(data)` - Inscription
- ✅ `activateAccount(data)` - Activation de compte
- ✅ Gestion localStorage des tokens

#### 🎓 studentService.js
- ✅ `getMyProfile()` - Profil étudiant
- ✅ `getMyGrades()` - Notes de l'étudiant
- ✅ `getAllStudents(filters)` - Liste des étudiants (Admin)
- ✅ `createStudent()` - Créer étudiant (Admin)
- ✅ `updateStudent()` - Modifier étudiant (Admin)
- ✅ `deleteStudent()` - Supprimer étudiant (Admin)

#### 📝 gradeService.js
- ✅ `getGrades(filters)` - Toutes les notes
- ✅ `getStudentGrades(studentId)` - Notes d'un étudiant
- ✅ `createGrade()` - Créer note (Enseignant/Admin)
- ✅ `updateGrade()` - Modifier note (Enseignant/Admin)
- ✅ `deleteGrade()` - Supprimer note (Admin)
- ✅ `getGradeStatistics()` - Statistiques
- ✅ `recalculateAverages()` - Recalculer moyennes

#### 🏛️ academicService.js
- ✅ Années académiques (CRUD)
- ✅ Semestres (CRUD)
- ✅ UE/Cours (CRUD)
- ✅ Sessions

### 2️⃣ **Système d'authentification JWT** ✅

#### axios.js
- ✅ Intercepteur de requête - Ajoute le token automatiquement
- ✅ Intercepteur de réponse - Gère le 401
- ✅ Refresh token automatique quand accès expiré
- ✅ Queue de requêtes pendant rafraîchissement
- ✅ Redirection login si refresh impossible

#### AuthContext.jsx
- ✅ `login(username, password)` - Authentification réelle
- ✅ `logout()` - Déconnexion
- ✅ `hasPermission(roles)` - Vérifier permissions
- ✅ `isAuthenticated()` - Vérifier connexion
- ✅ `hasRole(role)` - Vérifier rôle
- ✅ Chargement du localStorage au démarrage
- ✅ Gestion d'erreurs complète

### 3️⃣ **Configuration** ✅

#### .env
```
VITE_API_URL=http://localhost:8000/api
VITE_DEBUG=true
```

#### backend/settings.py (déjà configuré)
```
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
]

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

---

## 🚀 DÉMARRAGE RAPIDE

### 1️⃣ Démarrer Django

```bash
cd backend
python manage.py runserver
```

✅ API accessible à: http://localhost:8000/api

### 2️⃣ Démarrer React

```bash
cd frontend
npm install  # si première fois
npm run dev
```

✅ Frontend accessible à: http://localhost:5173

### 3️⃣ Tester l'intégration

Ouvrir http://localhost:5173/login et essayer de se connecter

---

## 🔑 MODÈLE DE RÉPONSE JWT

### Connexion - POST /api/token/

**Request:**
```json
{
  "username": "ahmed",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Utilisateur courant - GET /api/me/

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "ahmed",
  "email": "ahmed@university.edu",
  "role": "etudiant",
  "is_superuser": false
}
```

---

## 📚 EXEMPLES D'UTILISATION

### Connexion

```javascript
import { useAuth } from './context/AuthContext';

function LoginPage() {
  const { login, error } = useAuth();
  
  const handleLogin = async (username, password) => {
    try {
      const user = await login(username, password);
      console.log('Connecté:', user);
      // Rediriger vers dashboard
    } catch (err) {
      console.error('Erreur:', err.message);
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;
      handleLogin(username, password);
    }}>
      {/* ... form ... */}
    </form>
  );
}
```

### Récupérer les notes

```javascript
import { getMyGrades } from './api/gradeService';

function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await getMyGrades();
        setGrades(data); // Peut être array ou { results: [...] }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrades();
  }, []);
  
  if (loading) return <p>Chargement...</p>;
  
  return (
    <table>
      <tbody>
        {(Array.isArray(grades) ? grades : grades.results || []).map((grade) => (
          <tr key={grade.id}>
            <td>{grade.ue}</td>
            <td>{grade.moyenne}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Vérifier les permissions

```javascript
import { useAuth } from './context/AuthContext';

function Dashboard() {
  const { user, hasRole, hasPermission } = useAuth();
  
  return (
    <div>
      <h1>Bienvenue {user?.username}</h1>
      
      {hasRole('admin') && (
        <p>Vous avez accès à l'admin</p>
      )}
      
      {hasPermission(['enseignant', 'admin']) && (
        <p>Vous pouvez saisir les notes</p>
      )}
    </div>
  );
}
```

---

## 🔄 FLUX D'AUTHENTIFICATION

```
User saisit credentials
        ↓
login(username, password)
        ↓
POST /api/token/ → JWT tokens
        ↓
storeTokens() + storeUser()
        ↓
setUser() → Context mis à jour
        ↓
Redirect Dashboard
        ↓
Requête API
        ↓
Intercepteur: add Bearer token
        ↓
401? → Refresh token automatiquement
        ↓
Retry requête originale
```

---

## ⚠️ GESTION D'ERREURS

### Erreur de connexion

```javascript
try {
  await login(username, password);
} catch (error) {
  console.error('Code:', error.code);        // 400, 401, 500
  console.error('Message:', error.message);  // "Identifiants incorrects"
  console.error('Détails:', error.details);  // Réponse serveur
}
```

### Token expiré - Automatique ✅

L'intercepteur de réponse gère automatiquement:
- ✅ Détecte 401
- ✅ Récupère refresh token
- ✅ Appelle POST /api/token/refresh/
- ✅ Retry la requête
- ✅ Redirection login si impossib le

---

## 📋 CHECKLIST DE VÉRIFICATION

### ✅ Backend configuré
- [ ] Django en cours d'exécution: `python manage.py runserver`
- [ ] API accessible: http://localhost:8000/api
- [ ] CORS configuré pour http://localhost:5173
- [ ] JWT activé
- [ ] Utilisateurs créés avec les 4 rôles

### ✅ Frontend prêt
- [ ] `npm install` exécuté
- [ ] `.env` créé avec `VITE_API_URL`
- [ ] Services axios importés correctement
- [ ] AuthContext wrap l'app
- [ ] `npm run dev` fonctionne

### ✅ Tester connexion
- [ ] Login page charge
- [ ] Peut entrer identifiants
- [ ] Token reçu (vérifier localStorage)
- [ ] Redirect dashboard
- [ ] User info affichée

### ✅ Tester requêtes
- [ ] Récupérer notes fonctionne
- [ ] Créer note fonctionne
- [ ] Erreur 401 gérée (redirection login)
- [ ] Token refresh automatique

### ✅ Tester permissions
- [ ] Chaque rôle voit les bonnes pages
- [ ] Admin peut CRUD
- [ ] Enseignant peut saisir notes
- [ ] Étudiant peut lire notes
- [ ] Superviseur peut lire résultats

---

## 🛠️ DÉPANNAGE

### "API not found" → Erreur 404
**Solution:** Vérifier `VITE_API_URL` dans `.env`
```
VITE_API_URL=http://localhost:8000/api  ← Sans slash final
```

### "CORS error" → 403
**Solution:** Ajouter à Django settings.py
```python
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
```

### "Token invalide" → 401
**Solution:** 
1. Vérifier token en localStorage
2. Vérifier expiration (1h par défaut)
3. Vérifier que utilisateur existe en BD

### "Cannot read token" → Crash
**Solution:** Vérifier `AuthProvider` wrap l'app
```jsx
<AuthProvider>
  <App />
</AuthProvider>
```

---

## 📚 FICHIERS MODIFIÉS

```
frontend/src/
├── api/
│   ├── authService.js          ✨ NOUVEAU - JWT & login
│   ├── studentService.js       ✨ NOUVEAU - Étudiants CRUD
│   ├── gradeService.js         ✨ NOUVEAU - Notes CRUD
│   ├── academicService.js      ✨ NOUVEAU - Structure académique
│   └── axios.js                🔄 MODIFIÉ - Intercepteurs JWT
│
└── context/
    └── AuthContext.jsx         🔄 MODIFIÉ - Authentification réelle

frontend/.env                    ✨ NOUVEAU - Configuration API
```

---

## 🎯 PROCHAINES ÉTAPES

### 1. Adapter les pages existantes

Remplacer les données simulées par les vraies:

```javascript
// ❌ Avant (simulé)
const [grades, setGrades] = useState([
  { id: 1, ue: 'Math', moyenne: 15 },
  // ...
]);

// ✅ Après (réel)
useEffect(() => {
  gradeService.getMyGrades()
    .then(data => setGrades(data))
    .catch(err => console.error(err));
}, []);
```

### 2. Ajouter notificationService

```javascript
// Pour afficher toast notifications
export const notifySuccess = (message) => { /* ... */ }
export const notifyError = (message) => { /* ... */ }
```

### 3. Implémenter pagination

Certains endpoints retournent:
```json
{
  "count": 150,
  "next": "http://...",
  "previous": null,
  "results": [...]
}
```

### 4. Gérer les erreurs spécifiques

Ajouter gestion pour:
- Validation forms
- Messages métier
- Erreurs serveur 500
- Timeouts

---

## 🔐 SÉCURITÉ

✅ **Fait:**
- JWT tokens dans localStorage
- Refresh token automatique
- CORS activé
- Headers sécurisés

⚠️ **À considérer pour production:**
- Stocker tokens dans httpOnly cookies
- HTTPS obligatoire
- Rate limiting
- Input validation
- CSRF protection

---

## 📞 SUPPORT

**Problèmes courants:**
1. Lire les logs navigateur (F12)
2. Lire les logs Django (`python manage.py runserver`)
3. Vérifier requêtes API (Network tab)
4. Vérifier tokens (Application > localStorage)

**Ressources:**
- 📖 [Django REST Framework](https://www.django-rest-framework.org/)
- 📖 [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- 📖 [Axios](https://axios-http.com/)
- 📖 [React Context](https://react.dev/reference/react/useContext)

---

## ✨ CONCLUSION

Vous avez maintenant :

✅ **Authentification JWT complète**
✅ **Services API organisés par domaine**
✅ **Gestion automatique des tokens**
✅ **Context React pour l'état global**
✅ **Intercepteurs pour requêtes/réponses**
✅ **Configuration .env**
✅ **Prêt pour les données réelles**

**Prochaine étape:** Adapter les pages à utiliser les vrais services!

---

*Créé le: April 17, 2026*
*Version: 1.0*
*Status: ✅ Intégration Complète*
