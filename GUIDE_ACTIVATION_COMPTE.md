# Guide d'Activation de Compte - Flux Complet

## 🔄 Flux d'Inscription et Activation

### Étape 1: L'utilisateur s'inscrit via le formulaire frontend
- URL: `/signup`
- L'utilisateur remplit:
  - Nom, Prénom
  - Email
  - Rôle (étudiant, enseignant, superviseur)
  - Matricule et classe (si étudiant)
  - Justificatif/preuve d'appartenance (image JPG/PNG)
  - Mot de passe

```javascript
// Frontend envoie POST /api/register/
{
  "username": "email.split('@')[0]",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "etudiant",  // ✅ Sans accent!
  "preuve_appartenance": <File>
}
```

### Étape 2: Admin valide la preuve
1. Admin va sur Django Admin: `http://localhost:8000/admin`
2. Section "Utilisateurs personnalisés"
3. Rechercher l'utilisateur
4. Vérifier la preuve d'appartenance
5. Sélectionner l'utilisateur et cliquer sur "Valider les preuves d'inscription sélectionnées"

### Étape 3: 🔐 Code d'inscription généré
Dès que l'admin valide, le code est:
- ✅ **Généré** dans la base de données
- 📱 **Affichéau terminal** (console de développement Django)
- 📧 **Envoyé par email** (via console en développement)
- 💾 **Stocké** dans `CustomUser.code_activation`

### Étape 4: Utilisateur active son compte
- URL: `/activate-account`
- L'utilisateur rentre:
  - Username (email.split('@')[0])
  - Password
  - Code d'inscription

```javascript
// Frontend envoie POST /api/activate-account/
{
  "username": "john",
  "password": "SecurePass123",
  "code_inscription": "ABC12345"
}
```

### Étape 5: Compte activé ✅
- `is_active = True`
- `compte_active = True`
- Utilisateur peut se connecter normalement

---

## 🐛 Correction du Bug

### Avant (❌ Bug)
```python
# admin.py - ligne 59-60
try:
    validate_user_registration(user)
    validated_count += 1
except Exception:  # ❌ Exception silencieuse!
    email_errors += 1
```

Le code était généré mais aucune erreur d'email n'était affichée à l'admin.

### Après (✅ Corrigé)
```python
# admin.py - désormais affiche l'erreur exacte
except Exception as e:
    email_errors += 1
    error_details.append(f"{user.username}: {str(e)}")
    logger.error(f"Erreur validation {user.username}: {traceback.format_exc()}")
```

Et dans `services.py`:
```python
# ✅ Le code est TOUJOURS affiché, même si l'email échoue
logger.warning(
    "\n================ 📧 CODE INSCRIPTION POUR L'UTILISATEUR ================\n"
    "Utilisateur: %s\n"
    "Email: %s\n"
    "🔐 CODE: %s\n"
    "========================================================================\n",
    user.username,
    user.email,
    code.code,
)

try:
    send_mail(...)  # Essayer d'envoyer l'email
except Exception as e:
    logger.error(f"❌ Erreur lors de l'envoi: {str(e)}")
    # Ne pas relancer - le code est déjà visible
```

---

## 🧪 Test du Flux Complet

### 1. Créer un utilisateur de test
```bash
cd backend
python manage.py runserver
```

### 2. Via le frontend `/signup`
- Remplir le formulaire
- ✅ IMPORTANT: Rôle = `etudiant` (pas `étudiant`)

### 3. Via Django Admin - Valider
```
http://localhost:8000/admin
Notes > Utilisateurs personnalisés
```
- Sélectionner l'utilisateur
- Action: "Valider les preuves d'inscription sélectionnées"
- ✅ Vérifier la console Django pour le code

### 4. Console Django - Voir le code
```
================ 📧 CODE INSCRIPTION POUR L'UTILISATEUR ================
Utilisateur: john
Email: john@example.com
🔐 CODE: ABC12345
========================================================================
```

### 5. Frontend `/activate-account`
- Username: `john`
- Password: `SecurePass123`
- Code: `ABC12345`
- ✅ Cliquer "Activer"

### 6. Vérifier l'activation
```bash
# Vérifier en base de données
sqlite3 db.sqlite3
SELECT username, is_active, compte_active FROM notes_customuser WHERE username='john';
# john|1|1 ✅
```

---

## 📊 Structure des Données

### CodeInscription
```python
{
    "code": "ABC12345",        # Généré automatiquement
    "role": "etudiant",        # Rôle de l'utilisateur
    "actif": true,             # Activé après validation
    "utilisé_par": null,       # Qui l'a utilisé (après activation)
    "date_utilisation": null   # Quand (après activation)
}
```

### CustomUser
```python
{
    "username": "john",
    "email": "john@example.com",
    "role": "etudiant",
    "preuve_appartenance": "preuves_inscription/john_proof.jpg",
    "preuve_validee": true,              # ✅ Validé par admin
    "code_activation": "ABC12345",       # Code pour activer
    "code_inscription_attribue": "ABC12345",
    "is_active": false,                  # Avant activation
    "compte_active": false,              # Avant activation
    "date_validation_preuve": "2026-06-19T13:22:00Z"
}
```

Après activation:
```python
{
    # ... même données ...
    "is_active": true,                   # ✅ Activé
    "compte_active": true,               # ✅ Activé
}
```

---

## 🔍 Dépannage

### Le code n'est pas affiché en console
**Solution**: Vérifier que `EMAIL_BACKEND` dans settings.py est:
```python
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
```

### L'utilisateur voit "Erreur lors de l'activation"
**Causes possibles**:
1. ❌ Code incorrect
2. ❌ Username incorrect
3. ❌ Password incorrect
4. ❌ Compte déjà activé
5. ❌ Preuve pas encore validée

**Vérifier dans admin** les valeurs:
- `preuve_validee` = `True`
- `code_activation` = le code entré
- `is_active` = `False` (avant activation)

### L'email ne s'envoie pas
En développement (console backend):
- ✅ Le code s'affiche TOUJOURS en console (même si email échoue)
- 📧 L'email console backend affiche: "Content-Type: text/plain..."

En production:
- Configurer les variables d'environnement:
  ```env
  EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_HOST_USER=your-email@gmail.com
  EMAIL_HOST_PASSWORD=your-app-password
  EMAIL_USE_TLS=True
  ```

---

## 📝 Résumé des Corrections

| Fichier | Ligne | Change |
|---------|-------|--------|
| `admin.py` | 47-61 | Affiche l'erreur exacte + logging amélioré |
| `services.py` | 12-60 | Code affiché AVANT email + gestion d'erreur |
| `Signup.jsx` | 11 | `"étudiant"` → `"etudiant"` |
| `Signup.jsx` | 63-66 | Valeurs de rôle corrigées |

---

## ✅ Checklist de Vérification

- [ ] Django Admin affiche les utilisateurs avec preuves
- [ ] Sélectionner un utilisateur avec preuve
- [ ] Cliquer "Valider les preuves d'inscription sélectionnées"
- [ ] ✅ Code affiché dans la console Django
- [ ] ✅ Utilisateur marqué comme `preuve_validee`
- [ ] Frontend `/activate-account` reçoit le code du terminal
- [ ] Utilisateur entre username + password + code
- [ ] ✅ Compte activé avec `is_active = True`
- [ ] ✅ Utilisateur peut se connecter normalement

---

**Status**: 🔧 Corrigé et testé
**Date**: 2026-06-21
**Version**: 1.0
