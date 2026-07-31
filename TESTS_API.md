# 🧪 Tests API - Exemples avec cURL

Ce fichier contient des exemples pour tester l'API d'inscription directement sans frontend.

## 🚀 Prérequis

- Backend Django en cours d'exécution : `python manage.py runserver`
- Un code créé dans Django Admin

---

## 1️⃣ Créer un code de test

```bash
# Via Django Shell
python manage.py shell

>>> from notes.models import CodeInscription
>>> CodeInscription.objects.create(code="TEST1234", role="enseignant")
<CodeInscription: TEST1234 (enseignant) - ✅ Actif>

>>> CodeInscription.objects.create(code="TEST5678", role="etudiant")
<CodeInscription: TEST5678 (etudiant) - ✅ Actif>

>>> exit()
```

---

## 2️⃣ Test 1 : Inscription réussie

**Scénario** : Utilisateur avec un bon code

```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jean",
    "email": "jean@email.com",
    "password": "MdpSecret123",
    "code_inscription": "TEST1234"
  }'
```

**Réponse attendue (201):**
```json
{
  "message": "Inscription réussie !",
  "user": {
    "username": "jean",
    "email": "jean@email.com",
    "role": "enseignant"
  }
}
```

**Vérifier en Python:**
```bash
python manage.py shell

>>> from notes.models import CodeInscription, CustomUser
>>> CustomUser.objects.get(username="jean")
<CustomUser: jean (enseignant)>

>>> CodeInscription.objects.get(code="TEST1234")
<CodeInscription: TEST1234 (enseignant) - ❌ Utilisé>
# Remarquez : actif=False maintenant
```

---

## 3️⃣ Test 2 : Code invalide

**Scénario** : Utilisateur essaie un code qui n'existe pas

```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "marie",
    "email": "marie@email.com",
    "password": "MdpSecret123",
    "code_inscription": "INVALID"
  }'
```

**Réponse attendue (400):**
```json
{
  "code_inscription": [
    "Code d'inscription invalide ou déjà utilisé."
  ]
}
```

---

## 4️⃣ Test 3 : Code déjà utilisé

**Scénario** : Utilisateur essaie de réutiliser un code

```bash
# Premier essai (succès)
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "pierre",
    "email": "pierre@email.com",
    "password": "MdpSecret123",
    "code_inscription": "TEST5678"
  }'

# Réponse : 201 Succès

# Deuxième essai (même code)
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sophie",
    "email": "sophie@email.com",
    "password": "MdpSecret123",
    "code_inscription": "TEST5678"
  }'

# Réponse : 400 Erreur
```

**Réponse attendue (400):**
```json
{
  "code_inscription": [
    "Code d'inscription invalide ou déjà utilisé."
  ]
}
```

---

## 5️⃣ Test 4 : Username manquant

**Scénario** : Données incomplètes

```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "email@email.com",
    "password": "MdpSecret123",
    "code_inscription": "TEST1234"
  }'
```

**Réponse attendue (400):**
```json
{
  "username": [
    "Ce champ est obligatoire."
  ]
}
```

---

## 6️⃣ Test 5 : Email invalide

**Scénario** : Format d'email incorrect

```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "paul",
    "email": "pas-un-email",
    "password": "MdpSecret123",
    "code_inscription": "TEST1234"
  }'
```

**Réponse attendue (400):**
```json
{
  "email": [
    "Entrez une adresse email valide."
  ]
}
```

---

## 7️⃣ Test 6 : Username déjà existant

**Scénario** : Utilisateur essaie de créer un compte avec un username qui existe

```bash
# Créer le premier utilisateur
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "luc",
    "email": "luc1@email.com",
    "password": "MdpSecret123",
    "code_inscription": "TEST1234"
  }'

# Créer un code différent
python manage.py shell
>>> from notes.models import CodeInscription
>>> CodeInscription.objects.create(code="TEST9999", role="enseignant")
>>> exit()

# Tenter d'utiliser le même username
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "luc",
    "email": "luc2@email.com",
    "password": "AutreMdp123",
    "code_inscription": "TEST9999"
  }'
```

**Réponse attendue (400):**
```json
{
  "username": [
    "Un utilisateur avec ce nom d'utilisateur existe déjà."
  ]
}
```

---

## 8️⃣ Test avec PowerShell (Windows)

Si vous êtes sur Windows et que cURL ne fonctionne pas, utilisez PowerShell :

```powershell
# Test 1 : Succès
$body = @{
    username = "tom"
    email = "tom@email.com"
    password = "MdpSecret123"
    code_inscription = "TEST1234"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/register/" `
  -Method Post `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body

# Test 2 : Code invalide
$body = @{
    username = "laura"
    email = "laura@email.com"
    password = "MdpSecret123"
    code_inscription = "BADCODE"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/register/" `
  -Method Post `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body
```

---

## 9️⃣ Tests avec Postman

**Étapes :**

1. Ouvrir Postman
2. Créer une nouvelle requête (New → Request)
3. Mettre le type en **POST**
4. URL : `http://127.0.0.1:8000/api/register/`
5. Onglet **Body**
6. Sélectionner **raw** et **JSON**
7. Coller le JSON :

```json
{
    "username": "alice",
    "email": "alice@email.com",
    "password": "MdpSecret123",
    "code_inscription": "TEST1234"
}
```

8. Cliquer **Send**

---

## 🔟 Vérifier les résultats

### En Django Shell

```python
python manage.py shell

# Voir tous les utilisateurs créés
from notes.models import CustomUser
CustomUser.objects.all()

# Voir tous les codes (actifs ou non)
from notes.models import CodeInscription
CodeInscription.objects.all()

# Voir les codes actifs
CodeInscription.objects.filter(actif=True)

# Voir les codes utilisés
CodeInscription.objects.filter(actif=False)

# Voir qui a utilisé un code
from django.utils import timezone
code = CodeInscription.objects.get(code="TEST1234")
user = CustomUser.objects.filter(date_joined__gte=timezone.now() - timezone.timedelta(hours=1)).first()
print(f"{user.username} a utilisé le code {code.code}")
```

### En Django Admin

1. Aller sur http://127.0.0.1:8000/admin/
2. Users → Voir les nouveaux utilisateurs
3. Codes d'inscription → Vérifier l'état actif

---

## 📊 Tableau de tous les tests

| # | Scénario | Code | Email | Result | Erreur |
|---|----------|------|-------|--------|--------|
| 1 | ✅ Succès | TEST1234 | ✅ Valide | 201 | Non |
| 2 | ❌ Code invalide | INVALID | ✅ Valide | 400 | Code invalide |
| 3 | ❌ Code réutilisé | TEST1234 | ✅ Valide | 400 | Code invalide |
| 4 | ❌ Username absent | TEST1234 | ✅ Valide | 400 | Username requis |
| 5 | ❌ Email invalide | TEST1234 | ❌ Pas valide | 400 | Email invalide |
| 6 | ❌ Username existe | TEST1234 | ✅ Valide | 400 | Username existe |

---

## 🧹 Nettoyer les tests

Pour revenir à zéro et recommencer les tests :

```bash
python manage.py shell

# Supprimer les codes de test
from notes.models import CodeInscription
CodeInscription.objects.filter(code__startswith="TEST").delete()

# Supprimer les utilisateurs de test
from notes.models import CustomUser
CustomUser.objects.filter(username__in=["jean", "marie", "pierre", "sophie", "paul", "luc", "tom", "laura", "alice"]).delete()

>>> exit()
```

---

## 💾 Sauvegarder et réinitialiser la base

```bash
# Sauvegarder
cp db.sqlite3 db.sqlite3.backup

# Supprimer et recréer
rm db.sqlite3
python manage.py migrate

# Restaurer
cp db.sqlite3.backup db.sqlite3
```

---

**Créé le 21 février 2026** 📅
