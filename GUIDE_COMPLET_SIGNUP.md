# ⚙️ Guide Complet - Système d'inscription avec Code

## 📋 Table des matières
1. [Architecture du système](#1-architecture-du-système)
2. [Fichiers modifiés](#2-fichiers-modifiés)
3. [Récapitulatif des changements](#3-récapitulatif-des-changements)
4. [Exemple complet d'utilisation](#4-exemple-complet-dutilisation)
5. [Troubleshooting](#5-troubleshooting)

---

## 1️⃣ Architecture du système

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ SignupForm.jsx                                       │   │
│  │ - formData = {username, email, password, code}      │   │
│  │ - handleChange() → met à jour formData              │   │
│  │ - handleSignup() → appelle signup()                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ authService.js                                       │   │
│  │ - signup(data) → POST /api/register/                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (Django)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ urls.py                                              │   │
│  │ POST /api/register/ → InscriptionView                │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ views.py - InscriptionView                           │   │
│  │ 1. Reçoit {username, email, password, code}         │   │
│  │ 2. Appelle InscriptionSerializer.is_valid()         │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ serializers.py - InscriptionSerializer              │   │
│  │ 1. validate_code_inscription()                       │   │
│  │    - Vérifie que le code existe                      │   │
│  │    - Vérifie que le code est actif                   │   │
│  │    - Retourne l'objet CodeInscription                │   │
│  │                                                      │   │
│  │ 2. create(validated_data)                            │   │
│  │    - Crée l'utilisateur avec CustomUser.objects      │   │
│  │    - Assigne le rôle du code                         │   │
│  │    - Désactive le code                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ models.py                                            │   │
│  │ - CodeInscription (code, role, actif, date_creation) │   │
│  │ - CustomUser (username, email, password, role)       │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ admin.py - Django Admin                              │   │
│  │ - Affiche les codes disponibles                       │   │
│  │ - Permet de créer/modifier/supprimer les codes       │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓ Base de données                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ db.sqlite3                                           │   │
│  │ - Table CodeInscription                              │   │
│  │ - Table CustomUser                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Fichiers modifiés

### Backend

#### `models.py`
✅ Ajouté le modèle `CodeInscription` :
- `code` : CharField unique (8 caractères)
- `role` : CharField avec choix (enseignant/etudiant)
- `actif` : BooleanField (True par défaut)
- `date_creation` : DateTimeField auto

#### `admin.py`
✅ Enregistré `CodeInscription` dans Django Admin :
- Liste affichée : code, role, actif, date_creation
- Filtres : par rôle et état actif
- Recherche : par code

#### `serializers.py`
✅ Créé `InscriptionSerializer` :
- Champs : username, email, password, code_inscription
- Validation : vérifie le code
- Create : crée l'utilisateur et désactive le code

#### `views.py`
✅ Créé `InscriptionView` :
- POST request → appelle signup()
- Retourne 201 (créé) si succès
- Retourne 400 si erreur

#### `urls.py`
✅ Ajouté la route :
- POST `/api/register/` → InscriptionView

### Frontend

#### `src/services/authService.js`
✅ Ajouté la fonction `signup()` :
- Envoie POST à `/api/register/`
- Retourne les données du backend

#### `src/App.jsx`
✅ Modifié `SignupForm()` :
- State : formData avec 4 champs
- handleChange() : unique pour tous les champs
- handleSignup() : envoie les données
- Messages d'erreur/succès

---

## 3️⃣ Récapitulatif des changements

### Before ❌

```python
# models.py
# CodeInscription n'existait pas !
```

```jsx
// App.jsx - SignupForm n'était qu'un shell
function SignupForm() {
  return (
    <>
      <input placeholder="Nom d'utilisateur" />
      <input placeholder="Email" />
      <input type="password" placeholder="Mot de passe" />
      <input placeholder="Code d'inscription" />
      <button>Créer le compte</button>
    </>
  );
}
```

### After ✅

```python
# models.py
class CodeInscription(models.Model):
    code = models.CharField(max_length=8, unique=True, default=generer_code_inscription)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
```

```jsx
// App.jsx - SignupForm complètement fonctionnel
function SignupForm() {
  const [formData, setFormData] = useState({...});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => { /* ... */ };
  const handleSignup = async () => { /* ... */ };

  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {/* inputs + button */}
    </>
  );
}
```

---

## 4️⃣ Exemple complet d'utilisation

### Scénario : Jean s'inscrit

#### Étape 1 : Admin crée un code

```
1. Django Admin → http://127.0.0.1:8000/admin/
2. Codes d'inscription → Ajouter code d'inscription
3. Formulaire :
   - Code: TEST1234
   - Rôle: enseignant
4. Cliquer "Sauvegarder"
```

Django crée :
```
CodeInscription(
    code="TEST1234",
    role="enseignant",
    actif=True,
    date_creation=2026-02-21T10:30:00
)
```

#### Étape 2 : Jean s'inscrit sur React

React Application :
```
URL : http://localhost:5173/
Onglet : Inscription
```

Jean remplit le formulaire :
```
Username: jean
Email: jean@gmail.com
Password: MdpSecret123
Code: TEST1234
```

React `formData` devient :
```javascript
{
  username: "jean",
  email: "jean@gmail.com",
  password: "MdpSecret123",
  code_inscription: "TEST1234"
}
```

#### Étape 3 : Envoi au backend

```javascript
// authService.js
await signup(formData);
// Envoie POST à http://127.0.0.1:8000/api/register/
```

Requête HTTP :
```
POST /api/register/ HTTP/1.1
Content-Type: application/json

{
  "username": "jean",
  "email": "jean@gmail.com",
  "password": "MdpSecret123",
  "code_inscription": "TEST1234"
}
```

#### Étape 4 : Backend traite la demande

Django reçoit la requête :
```python
# InscriptionView.post()
serializer = InscriptionSerializer(data=request.data)
if serializer.is_valid():
    user = serializer.save()
```

Le sérialiseur valide :
```python
# validate_code_inscription()
code = CodeInscription.objects.get(code="TEST1234", actif=True)
# ✅ Trouvé et actif !
return code
```

Le sérialiseur crée :
```python
# create()
user = User.objects.create_user(
    username="jean",
    email="jean@gmail.com",
    password="MdpSecret123",
    role="enseignant"  # Du code
)

code.actif = False  # Désactiver
code.save()

return user
```

Base de données :
```
AVANT :
- CodeInscription: code=TEST1234, actif=True ✅
- CustomUser: (aucun jean)

APRÈS :
- CodeInscription: code=TEST1234, actif=False ❌ (DÉSACTIVÉ)
- CustomUser: jean, enseignant ✅ (CRÉÉ)
```

#### Étape 5 : React affiche le succès

```python
# Backend retourne
{
    "message": "Inscription réussie !",
    "user": {
        "username": "jean",
        "email": "jean@gmail.com",
        "role": "enseignant"
    }
}
```

React affiche :
```
✅ Compte créé avec succès !

(formulaire vidé)
```

---

## 5️⃣ Troubleshooting

### Problème 1 : "Cannot serialize function: lambda"

**Cause** : Le modèle utilisait `default=lambda: ...`

**Solution** : Utiliser une fonction nommée
```python
def generer_code_inscription():
    return uuid.uuid4().hex[:8].upper()

code = models.CharField(max_length=8, unique=True, default=generer_code_inscription)
```

### Problème 2 : "Code d'inscription invalide ou déjà utilisé"

**Causes possibles** :
1. Le code n'existe pas dans la base
2. Le code existe mais `actif=False`
3. Le code est en minuscules/majuscules (mauvais format)

**Debug** :
```python
# Django Shell
python manage.py shell

# Vérifier les codes
from notes.models import CodeInscription
CodeInscription.objects.all()

# Voir les détails
code = CodeInscription.objects.get(code="TEST1234")
print(code.actif)  # Doit être True
```

### Problème 3 : "An error occurred during registration"

**Cause** : Données manquantes ou username/email déjà existants

**Debug** :
```javascript
// Dans handleSignup, afficher l'erreur complète
catch (err) {
  console.log(err.response);  // Voir les détails
  const errorMsg = JSON.stringify(err.response?.data);
  setError(errorMsg);
}
```

### Problème 4 : Le code n'est pas désactivé

**Cause** : La fonction `create()` du sérialiseur n'a pas été appelée

**Vérification** :
1. Le sérialiseur.is_valid() a retourné True ?
2. Le backend a appelé serializer.save() ?
3. Le code était bien actif avant ?

**Debug** :
```python
# Dans InscriptionSerializer.create()
print(f"Code avant : {code.actif}")
code.actif = False
code.save()
print(f"Code après : {code.actif}")
```

### Problème 5 : "CORS error" ou "Access-Control-Allow-Origin"

**Cause** : Axios n'est pas configuré correctement

**Solution** : Vérifier que l'instance `api` est importée :
```javascript
import api from "../api/axios";
// et que axios.js a la bonne baseURL
```

---

## 📋 Checklist finale

- [ ] Modèle `CodeInscription` créé et migré
- [ ] `CodeInscription` enregistré dans Django Admin
- [ ] `InscriptionSerializer` créé avec validation
- [ ] `InscriptionView` créé avec POST
- [ ] Route `/api/register/` ajoutée
- [ ] Fonction `signup()` dans authService.js
- [ ] `SignupForm` modifié avec formData et handleChange
- [ ] Messages d'erreur/succès affichés
- [ ] Code Django test créé dans l'admin
- [ ] Frontend teste l'inscription
- [ ] Code est bien désactivé après utilisation
- [ ] Erreur affichée si code invalide
- [ ] Erreur affichée si username existe

---

**Version** : 1.0  
**Date** : 21 février 2026  
**Statut** : ✅ Prêt pour la production
