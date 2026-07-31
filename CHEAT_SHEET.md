# ⚡ Commandes rapides - Cheat sheet

## 🚀 Démarrer le projet

### Backend - Django

```bash
# Naviguer au dossier backend
cd backend

# Installer les dépendances
pip install django djangorestframework

# Appliquer les migrations
python manage.py migrate

# Lancer le serveur
python manage.py runserver
```

**Résultat** : http://127.0.0.1:8000/

### Frontend - React

```bash
# Naviguer au dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

**Résultat** : http://localhost:5173/

---

## 🔧 Django - Commandes utiles

### Django Shell

```bash
# Lancer le shell Python
python manage.py shell

# Importer les modèles
from notes.models import CodeInscription, CustomUser

# Créer un code
CodeInscription.objects.create(code="TEST1234", role="enseignant")

# Voir tous les codes
CodeInscription.objects.all()

# Voir les codes actifs
CodeInscription.objects.filter(actif=True)

# Voir les codes utilisés
CodeInscription.objects.filter(actif=False)

# Voir un code spécifique
code = CodeInscription.objects.get(code="TEST1234")
print(f"Actif: {code.actif}")

# Voir tous les utilisateurs
CustomUser.objects.all()

# Voir un utilisateur
user = CustomUser.objects.get(username="jean")
print(f"Rôle: {user.role}")

# Supprimer un code
CodeInscription.objects.filter(code="TEST1234").delete()

# Supprimer un utilisateur
CustomUser.objects.filter(username="jean").delete()

# Quitter le shell
exit()
```

### Migrations

```bash
# Créer les migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Voir le statut des migrations
python manage.py showmigrations

# Revenir en arrière
python manage.py migrate notes 0001

# Réinitialiser la base (⚠️ ATTENTION - Supprime tout)
python manage.py migrate notes zero
```

### Admin Django

```bash
# Créer un super-utilisateur
python manage.py createsuperuser

# Changer le mot de passe d'un utilisateur
python manage.py changepassword username

# Voir les utilisateurs
python manage.py shell
>>> from django.contrib.auth.models import User
>>> User.objects.all()
```

---

## 🧪 Test l'API

### Avec cURL (Windows PowerShell)

```powershell
# Test 1 : Inscription réussie
$body = @{
    username = "test1"
    email = "test1@email.com"
    password = "Password123"
    code_inscription = "TEST1234"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/register/" `
  -Method Post `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body

# Test 2 : Code invalide
$body = @{
    username = "test2"
    email = "test2@email.com"
    password = "Password123"
    code_inscription = "BADCODE"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/register/" `
  -Method Post `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body
```

### Avec cURL (Linux/Mac)

```bash
# Test 1 : Inscription réussie
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test1",
    "email": "test1@email.com",
    "password": "Password123",
    "code_inscription": "TEST1234"
  }'

# Test 2 : Code invalide
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test2",
    "email": "test2@email.com",
    "password": "Password123",
    "code_inscription": "BADCODE"
  }'
```

---

## 📝 Fichiers à connaître

### Backend

```
backend/
├── notes/
│   ├── models.py          # CodeInscription
│   ├── admin.py           # CodeInscriptionAdmin
│   ├── serializers.py     # InscriptionSerializer
│   ├── views.py           # InscriptionView
│   ├── urls.py            # Routes API
│   └── migrations/        # Fichiers de migration
├── manage.py
└── db.sqlite3             # Base de données
```

### Frontend

```
frontend/
├── src/
│   ├── App.jsx            # SignupForm
│   ├── services/
│   │   └── authService.js # signup()
│   └── api/
│       └── axios.js       # Configuration API
├── package.json
├── vite.config.js
└── index.html
```

---

## 🐛 Debugging

### Backend - Voir les logs

```bash
# Lancer le serveur avec logs verbose
python manage.py runserver --debug

# Voir les requêtes HTTP
# Elles apparaissent automatiquement dans le terminal
```

### Frontend - Ouvrir la console

```
Appuyer sur F12 → Onglet "Console"
Vous verrez :
- Les erreurs JavaScript
- Les logs console.log()
- Les requêtes réseau
```

### Django Shell - Tester manuellement

```python
from notes.serializers import InscriptionSerializer
from notes.models import CodeInscription

# Tester la validation
data = {
    "username": "test",
    "email": "test@email.com",
    "password": "Password123",
    "code_inscription": "BADCODE"
}

serializer = InscriptionSerializer(data=data)
print(serializer.is_valid())  # False
print(serializer.errors)      # {"code_inscription": ["..."]}
```

---

## 🗑️ Nettoyer

### Supprimer les données de test

```bash
python manage.py shell

# Supprimer les codes de test
from notes.models import CodeInscription
CodeInscription.objects.filter(code__startswith="TEST").delete()

# Supprimer les utilisateurs de test
from notes.models import CustomUser
CustomUser.objects.filter(username__in=["jean", "test1", "test2"]).delete()

exit()
```

### Réinitialiser la base complètement

```bash
# Linux/Mac
rm backend/db.sqlite3
python manage.py migrate

# Windows (PowerShell)
Remove-Item backend/db.sqlite3
python manage.py migrate
```

---

## 📦 Installer les dépendances

### Backend

```bash
# Installation complète
pip install django djangorestframework

# Ou installer depuis un fichier requirements.txt
pip install -r requirements.txt
```

### Frontend

```bash
# Installation complète
npm install

# Ou installer individuellement
npm install axios
npm install react react-dom
```

---

## 🔐 Authentification

### Obtenir un token JWT

```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jean",
    "password": "MdpSecret123"
  }'

# Réponse
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
# }
```

### Utiliser le token

```bash
curl -X GET http://127.0.0.1:8000/api/notes/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## 📊 Voir la base de données

### Via Django Admin

```
1. Aller sur http://127.0.0.1:8000/admin/
2. Entrer username et password
3. Voir :
   - Codes d'inscription
   - Utilisateurs
   - Autres modèles
```

### Via Django Shell

```python
from notes.models import *
from django.contrib.auth.models import *

# Voir tout
CodeInscription.objects.all().values()
CustomUser.objects.all().values()

# Filtrer
CodeInscription.objects.filter(actif=True).count()  # Nombre de codes actifs

# Statistiques
print(f"Codes: {CodeInscription.objects.count()}")
print(f"Users: {CustomUser.objects.count()}")
print(f"Codes utilisés: {CodeInscription.objects.filter(actif=False).count()}")
```

---

## 🎓 Apprendre

### Documentation officielle

- Django : https://docs.djangoproject.com/
- Django REST Framework : https://www.django-rest-framework.org/
- React : https://react.dev/

### Tutoriels recommandés

```bash
# Créer un projet Django REST
django-admin startproject myproject
python manage.py startapp myapp

# Créer un projet React avec Vite
npm create vite@latest my-app -- --template react
```

---

## 💾 Sauvegarder et restaurer

### Sauvegarder la base

```bash
# Linux/Mac
cp backend/db.sqlite3 backend/db.sqlite3.backup

# Windows (PowerShell)
Copy-Item backend/db.sqlite3 backend/db.sqlite3.backup
```

### Restaurer la base

```bash
# Linux/Mac
cp backend/db.sqlite3.backup backend/db.sqlite3

# Windows (PowerShell)
Copy-Item backend/db.sqlite3.backup backend/db.sqlite3
```

### Exporter les données

```bash
# En JSON
python manage.py dumpdata notes > data.json

# Restaurer depuis JSON
python manage.py loaddata data.json
```

---

## 🚨 Problèmes courants

### "Module not found: 'rest_framework'"

```bash
pip install djangorestframework
```

### "Cannot serialize function: lambda"

```
Voir models.py ligne 105-140
Utiliser une fonction nommée au lieu d'une lambda
```

### "CORS error"

```
Vérifier que axios.js a la bonne baseURL
http://127.0.0.1:8000/api/
```

### "Code d'inscription invalide"

```python
# Vérifier que le code existe
python manage.py shell
from notes.models import CodeInscription
CodeInscription.objects.get(code="TEST1234")

# Vérifier qu'il est actif
code.actif  # Doit être True
```

### "Port 8000 déjà utilisé"

```bash
# Utiliser un autre port
python manage.py runserver 8080

# Ou tuer le processus
# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

## ⌨️ Raccourcis utiles

| Commande | Résultat |
|----------|----------|
| `python manage.py runserver` | Lancer Django |
| `npm run dev` | Lancer React |
| `python manage.py shell` | Django Shell |
| `python manage.py migrate` | Appliquer migrations |
| `python manage.py makemigrations` | Créer migrations |
| `F12` | Ouvrir console React |
| `Ctrl+C` | Arrêter le serveur |
| `Ctrl+K` (Django Admin) | Recherche rapide |

---

## 📞 Aide rapide

| Question | Commande |
|----------|----------|
| Voir les codes ? | `python manage.py shell` → `CodeInscription.objects.all()` |
| Voir les users ? | `python manage.py shell` → `CustomUser.objects.all()` |
| Créer un code ? | Django Admin ou `CodeInscription.objects.create(...)` |
| Tester l'API ? | `curl` ou Postman |
| Voir les logs ? | Terminal ou Console (F12) |
| Réinitialiser ? | `rm db.sqlite3` + `migrate` |

---

**Créé le 21 février 2026** 📅  
**Status** : ✅ Cheat sheet complet
