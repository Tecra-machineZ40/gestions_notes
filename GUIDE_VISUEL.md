# 🎨 Guide visuel rapide - Système d'inscription

## 🎯 Vue d'ensemble en 1 minute

```
ADMIN
  │
  ├─→ Django Admin
  │   └─→ Crée code "A1B2C3D4"
  │
  └─→ Partage le code à l'enseignant

ENSEIGNANT
  │
  ├─→ React Frontend
  │   └─→ Rempli le formulaire
  │       - Username: jean
  │       - Email: jean@email.com
  │       - Password: MdpSecret123
  │       - Code: A1B2C3D4
  │
  └─→ Clique "Créer le compte"

BACKEND
  │
  ├─→ Reçoit les données
  │   └─→ InscriptionView.post()
  │
  ├─→ Valide le code
  │   └─→ InscriptionSerializer.validate_code_inscription()
  │       - Code existe ?
  │       - Code actif ?
  │
  ├─→ Crée l'utilisateur
  │   └─→ InscriptionSerializer.create()
  │       - CustomUser.objects.create_user()
  │       - role = "enseignant"
  │       - code.actif = False
  │
  └─→ Retourne 201 ✅

FRONTEND
  │
  ├─→ Affiche ✅ "Compte créé avec succès !"
  │   └─→ setMessage()
  │
  └─→ Vide le formulaire
      └─→ setFormData({...})

BASE DE DONNÉES
  │
  ├─→ CodeInscription
  │   - code="A1B2C3D4"
  │   - role="enseignant"
  │   - actif=FALSE ❌ (DÉSACTIVÉ)
  │
  └─→ CustomUser
      - username="jean"
      - email="jean@email.com"
      - role="enseignant"
```

---

## 📊 Diagramme de flux

```
┌──────────────────┐
│  Utilisateur     │
│  remplit form    │
└────────┬─────────┘
         │
         ▼
   ┌─────────────────────┐
   │  handleChange(e)    │
   │  ✅ Extraction name │
   │  ✅ Extraction value│
   │  ✅ Mise à jour     │
   │     formData        │
   └────────┬────────────┘
            │
            ▼
   ┌─────────────────────┐
   │ Utilisateur clique  │
   │ "Créer le compte"   │
   └────────┬────────────┘
            │
            ▼
   ┌─────────────────────┐
   │ handleSignup()      │
   │ ✅ async/await      │
   │ ✅ try/catch        │
   └────────┬────────────┘
            │
            ▼
   ┌─────────────────────┐
   │ signup(formData)    │
   │ POST /api/register/ │
   │ {"username", ...}   │
   └────────┬────────────┘
            │ HTTP
            ▼
   ┌─────────────────────────────┐
   │ Backend reçoit              │
   │ InscriptionView.post()      │
   └────────┬────────────────────┘
            │
            ▼
   ┌─────────────────────────────┐
   │ Valider via serializer      │
   │ ✅ Code existe ?            │
   │ ✅ Code actif ?             │
   │ ✅ Email valide ?           │
   └────────┬────────────────────┘
            │
            ├─ NON → 400 Error ──┐
            │                     │
            ▼                     │
   ┌─────────────────────────────┐│
   │ create()                    ││
   │ ✅ CustomUser.create()     ││
   │ ✅ Code.actif = False       ││
   │ ✅ Sauvegarder              ││
   └────────┬────────────────────┘│
            │                     │
            ▼                     │
   ┌─────────────────────────────┐│
   │ Retourner 201 ✅            ││
   │ {"message", "user"}         ││
   └────────┬────────────────────┘│
            │                     │
            └─────────┬───────────┘
                      │
                      ▼ HTTP
            ┌─────────────────────┐
            │ Frontend reçoit      │
            │ ✅ ou ❌            │
            └────────┬────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   ┌─────────────┐      ┌─────────────────┐
   │ Succès ✅   │      │ Erreur ❌       │
   │ setMessage()│      │ setError()      │
   │ setFormData │      │ Afficher msg    │
   │ ({})        │      │ erreur          │
   └─────────────┘      └─────────────────┘
```

---

## 🔑 Clés du système

### 1️⃣ formData - L'état central

```javascript
formData = {
  username: "jean",           // Texte saisi par l'utilisateur
  email: "jean@email.com",    // Texte saisi par l'utilisateur
  password: "MdpSecret123",   // Texte saisi par l'utilisateur
  code_inscription: "A1B2"    // Texte saisi par l'utilisateur
}
```

**Avantage** : Un seul objet pour tout

### 2️⃣ handleChange - Fonction universelle

```javascript
handleChange(e) {
  const { name, value } = e.target;  // "username" et "jean"
  
  setFormData({
    ...formData,               // Copier tous les autres champs
    [name]: value              // Mettre à jour celui-ci
  });
}

// Pour tous les inputs :
<input name="username" onChange={handleChange} />
<input name="email" onChange={handleChange} />
<input name="password" onChange={handleChange} />
<input name="code_inscription" onChange={handleChange} />
```

**Avantage** : Une fonction pour tous les inputs

### 3️⃣ handleSignup - Gestion d'erreur

```javascript
handleSignup = async () => {
  try {
    await signup(formData);       // ✅ Attendre
    setMessage("Succès !");       // ✅ Afficher succès
  } catch (err) {
    setError("Erreur");           // ✅ Afficher erreur
  }
}
```

**Avantage** : Gestion propre des erreurs

### 4️⃣ Backend - Validation stricte

```python
# 1. Sérialiseur valide le code
code = CodeInscription.objects.get(code=value.upper(), actif=True)

# 2. Si valide : créer l'utilisateur
user = User.objects.create_user(
    username=...,
    role=code.role  # Role du code
)

# 3. Désactiver le code
code.actif = False
code.save()

# 4. Retourner la réponse
return Response({"message": "Succès", ...}, status=201)
```

**Avantage** : Validation côté serveur

---

## 📱 Interface utilisateur

### État initial

```
┌─────────────────────────────────────┐
│  Gestion Académique des Notes      │
├─────────────────────────────────────┤
│                                     │
│  [ Connexion ]  [ Inscription ]     │
│                     (sélectionné)   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Nom d'utilisateur           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Email                       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Mot de passe                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Code d'inscription          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Créer le compte             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Après remplissage

```
┌─────────────────────────────────────┐
│  Gestion Académique des Notes      │
├─────────────────────────────────────┤
│                                     │
│  [ Connexion ]  [ Inscription ]     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ jean                        │   │ ← Rempli
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ jean@email.com              │   │ ← Rempli
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ••••••••••••                │   │ ← Rempli
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ A1B2C3D4                    │   │ ← Rempli
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Créer le compte             │   │ ← Cliquable
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Après soumission - Succès

```
┌─────────────────────────────────────┐
│  Gestion Académique des Notes      │
├─────────────────────────────────────┤
│                                     │
│  ✅ Compte créé avec succès !       │ ← Message vert
│                                     │
│  [ Connexion ]  [ Inscription ]     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │ ← Vidé
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │ ← Vidé
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │ ← Vidé
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │ ← Vidé
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Créer le compte             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Après soumission - Erreur

```
┌─────────────────────────────────────┐
│  Gestion Académique des Notes      │
├─────────────────────────────────────┤
│                                     │
│  ❌ Code invalide ou déjà utilisé   │ ← Message rouge
│                                     │
│  [ Connexion ]  [ Inscription ]     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ jean                        │   │ ← Conservé
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ jean@email.com              │   │ ← Conservé
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ••••••••••••                │   │ ← Conservé
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ BADCODE                     │   │ ← Conservé
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Créer le compte             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🗂️ Arborescence des fichiers modifiés

```
Backend
├── models.py
│   └─ CodeInscription
│      ├─ code (CharField)
│      ├─ role (CharField)
│      ├─ actif (BooleanField) ← CLÉ
│      └─ date_creation (DateTime)
│
├── admin.py
│   └─ CodeInscriptionAdmin
│      ├─ list_display
│      ├─ list_filter
│      └─ search_fields
│
├── serializers.py
│   └─ InscriptionSerializer
│      ├─ username (CharField)
│      ├─ email (EmailField)
│      ├─ password (CharField)
│      ├─ code_inscription (CharField)
│      ├─ validate_code_inscription() ← VALIDATION
│      └─ create() ← CRÉATION USER
│
├── views.py
│   └─ InscriptionView
│      └─ post() ← TRAITEMENT
│
└── urls.py
   └─ path('register/', InscriptionView.as_view())

Frontend
├── authService.js
│   └─ signup(data) ← API CALL
│
└── App.jsx
   └─ SignupForm()
      ├─ formData ← ÉTAT
      ├─ handleChange() ← MISE À JOUR
      ├─ handleSignup() ← ENVOI
      └─ Rendering ← AFFICHAGE
```

---

## 📈 Étapes d'exécution

```
1. Admin crée code
   Django Admin → CodeInscription.objects.create()
   BASE: code="A1B2C3D4", actif=True ✅

2. Utilisateur remplit formulaire
   React → setFormData() × 4
   STATE: formData rempli

3. Utilisateur clique
   React → handleSignup()
   → await signup(formData)

4. Frontend envoie
   Axios → POST /api/register/
   HTTP: {"username", "email", "password", "code_inscription"}

5. Backend reçoit
   Django → InscriptionView.post()
   PARSE: request.data

6. Backend valide
   Serializer → validate_code_inscription()
   CHECK: Code existe ? Actif ?
   ✅ OUI → Continuer
   ❌ NON → Erreur 400

7. Backend crée user
   Serializer → create()
   CREATE: CustomUser
   UPDATE: code.actif = False

8. Backend retourne
   Django → Response(201)
   HTTP: {"message", "user"}

9. Frontend traite
   React → setMessage()
   → setFormData({})

10. Interface mise à jour
    React → Re-render
    DISPLAY: ✅ Succès ! Inputs vides
```

---

## 🎯 Points clés à retenir

| Concept | Rôle | Exemple |
|---------|------|---------|
| formData | État central | `{username, email, password, code}` |
| handleChange | Mise à jour | Extrait `name` et `value` |
| spread `...` | Copie objets | `{...formData, [name]: value}` |
| async/await | Requête réseau | Attendre la réponse |
| try/catch | Gestion erreur | Capturer les exceptions |
| CodeInscription | Base données | Codes uniques, actifs |
| validate_code_inscription | Backend validation | Vérifier code |
| create | Backend création | Créer user + désactiver code |
| Response(201) | Succès HTTP | Créé avec succès |
| Response(400) | Erreur HTTP | Données invalides |

---

## ✅ Résumé visuel

```
┌────────────────────────────────────────────────┐
│           SYSTÈME D'INSCRIPTION                │
├────────────────────────────────────────────────┤
│                                                │
│  Admin           Frontend          Backend     │
│   │                 │                 │        │
│   ├─ Crée code ─────────────────────>│        │
│   │                 │                 │        │
│   └─────────────────│─ Inscription ──>│        │
│                     │    (formulaire) │        │
│                     │                 │        │
│                     │<─ Valide code ──│        │
│                     │<─ Crée user ────│        │
│                     │<─ Succès ───────│        │
│                     │                 │        │
│                     │  ✅ Compte créé │        │
│                     │  ✅ Code désac. │        │
│                     │  ✅ User créé   │        │
│                     │                 │        │
└────────────────────────────────────────────────┘
```

---

**Créé le 21 février 2026** 📅
