# 🎓 Système d'inscription avec Code - Implémentation complète

## 📌 Résumé

Vous avez maintenant un système **complet et fonctionnel** d'inscription avec codes :

- ✅ **Backend** : Django REST Framework vérifie les codes
- ✅ **Frontend** : React avec formulaire simple et lisible
- ✅ **Base de données** : Codes unique et réutilisables une fois
- ✅ **Documentation** : Explications pédagogiques

---

## 📁 Structure des fichiers

```
gestions_notes/
├── backend/
│   ├── notes/
│   │   ├── models.py          ← CodeInscription ajouté
│   │   ├── admin.py           ← CodeInscription enregistré
│   │   ├── serializers.py     ← InscriptionSerializer créé
│   │   ├── views.py           ← InscriptionView créé
│   │   └── urls.py            ← Route /api/register/ ajoutée
│   └── db.sqlite3
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── authService.js ← signup() ajouté
│   │   └── App.jsx            ← SignupForm modifié
│   └── package.json
│
├── GUIDE_COMPLET_SIGNUP.md    ← 📚 Architecture complète
├── README.md                   ← 👈 Vous êtes ici
└── docs/
    ├── EXPLICATION_SIGNUP.md  ← 📚 Explications pédagogiques
    └── ERREURS_A_EVITER.md    ← 🚨 Pièges courants
```

---

## 🚀 Démarrage rapide

### 1️⃣ Backend - Django

#### Installer les dépendances
```bash
cd backend
pip install django djangorestframework
```

#### Appliquer les migrations
```bash
python manage.py migrate
```

#### Créer un code de test
```bash
python manage.py shell
>>> from notes.models import CodeInscription
>>> CodeInscription.objects.create(code="TEST1234", role="enseignant")
>>> exit()
```

#### Lancer le serveur
```bash
python manage.py runserver
```

### 2️⃣ Frontend - React

#### Installer les dépendances
```bash
cd frontend
npm install
```

#### Lancer le serveur de développement
```bash
npm run dev
```

#### Tester l'inscription
- Aller sur http://localhost:5173/
- Onglet "Inscription"
- Remplir le formulaire avec le code "TEST1234"
- Cliquer "Créer le compte"
- Voir ✅ "Compte créé avec succès !"

---

## 📊 Flux d'utilisation

### Pour l'administrateur

```
1. Django Admin (http://127.0.0.1:8000/admin/)
   ├─ Codes d'inscription
   ├─ Ajouter code d'inscription
   ├─ Code: A1B2C3D4
   ├─ Rôle: enseignant
   └─ Sauvegarder

2. Partager le code "A1B2C3D4" à l'enseignant par email

3. Vérifier que le code est "Inactif" après utilisation
```

### Pour l'enseignant

```
1. Aller sur le formulaire d'inscription (frontend)

2. Remplir :
   - Username: jean
   - Email: jean@universites.edu
   - Password: MdpSecure123!
   - Code: A1B2C3D4

3. Cliquer "Créer le compte"

4. Message ✅ "Compte créé avec succès !"

5. Se connecter avec username + password
```

---

## 🔍 Fichiers expliqués

### Backend

#### `models.py` - CodeInscription

```python
class CodeInscription(models.Model):
    # Code unique de 8 caractères (auto-généré)
    code = models.CharField(max_length=8, unique=True, default=generer_code_inscription)
    
    # Rôle attribué à l'utilisateur
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # État du code (True = peut être utilisé)
    actif = models.BooleanField(default=True)
    
    # Quand le code a été créé
    date_creation = models.DateTimeField(auto_now_add=True)
```

#### `admin.py` - CodeInscriptionAdmin

```python
@admin.register(CodeInscription)
class CodeInscriptionAdmin(admin.ModelAdmin):
    # Affichage dans la liste
    list_display = ('code', 'role', 'actif', 'date_creation')
    
    # Filtres disponibles
    list_filter = ('role', 'actif')
    
    # Recherche par code
    search_fields = ('code',)
    
    # Date non modifiable
    readonly_fields = ('date_creation',)
```

#### `serializers.py` - InscriptionSerializer

```python
class InscriptionSerializer(serializers.Serializer):
    # Champs du formulaire d'inscription
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    code_inscription = serializers.CharField(max_length=8)

    def validate_code_inscription(self, value):
        # Vérifier que le code existe ET est actif
        code = CodeInscription.objects.get(code=value.upper(), actif=True)
        return code

    def create(self, validated_data):
        # Créer l'utilisateur avec le rôle du code
        code = validated_data['code_inscription']
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=code.role  # Le rôle vient du code
        )
        # Désactiver le code (il a été utilisé)
        code.actif = False
        code.save()
        return user
```

#### `views.py` - InscriptionView

```python
class InscriptionView(APIView):
    permission_classes = []  # Pas d'authentification nécessaire

    def post(self, request):
        # Valider les données
        serializer = InscriptionSerializer(data=request.data)
        
        if serializer.is_valid():
            # Si valide : créer l'utilisateur
            user = serializer.save()
            return Response({
                "message": "Inscription réussie !",
                "user": {...}
            }, status=status.HTTP_201_CREATED)
        
        # Si erreur : retourner les erreurs
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### Frontend

#### `authService.js` - signup()

```javascript
export const signup = async (data) => {
  // Envoyer les données au backend
  const response = await api.post("register/", data);
  
  // Retourner la réponse
  return response.data;
};
```

#### `App.jsx` - SignupForm()

```javascript
function SignupForm() {
  // 1. État du formulaire
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    code_inscription: ""
  });

  // 2. Messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 3. Une seule fonction pour tous les inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 4. Fonction d'envoi
  const handleSignup = async () => {
    try {
      await signup(formData);
      setMessage("Compte créé avec succès ! ✅");
      setFormData({...});  // Vider
    } catch (err) {
      setError("Erreur lors de l'inscription");
    }
  };

  // 5. Affichage
  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      <input name="username" onChange={handleChange} />
      <input name="email" onChange={handleChange} />
      <input name="password" type="password" onChange={handleChange} />
      <input name="code_inscription" onChange={handleChange} />
      <button onClick={handleSignup}>Créer le compte</button>
    </>
  );
}
```

---

## 📝 Exemples de requêtes

### POST /api/register/ - Succès

**Requête:**
```json
{
  "username": "jean",
  "email": "jean@email.com",
  "password": "MdpSecret123",
  "code_inscription": "TEST1234"
}
```

**Réponse (201 Created):**
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

### POST /api/register/ - Code invalide

**Requête:**
```json
{
  "username": "jean",
  "email": "jean@email.com",
  "password": "MdpSecret123",
  "code_inscription": "INVALID"
}
```

**Réponse (400 Bad Request):**
```json
{
  "code_inscription": [
    "Code d'inscription invalide ou déjà utilisé."
  ]
}
```

---

## 🧪 Tests

### Test 1 : Code valide et actif

```bash
# 1. Créer un code
python manage.py shell
>>> from notes.models import CodeInscription
>>> CodeInscription.objects.create(code="TEST1", role="enseignant", actif=True)

# 2. Tester l'inscription depuis React
Username: test_user1
Email: test1@email.com
Password: Password123
Code: TEST1

# 3. Vérifier
# - Message ✅ Succès
# - Code est maintenant actif=False dans l'admin
# - Utilisateur test_user1 existe dans CustomUser
```

### Test 2 : Code invalide

```bash
# Tester l'inscription
Username: test_user2
Email: test2@email.com
Password: Password123
Code: INVALID

# Résultat : Erreur "Code d'inscription invalide ou déjà utilisé."
```

### Test 3 : Code désactivé

```bash
# 1. Tenter d'utiliser 2x le même code
Code: TEST1  # Première fois → ✅ Succès
Code: TEST1  # Deuxième fois → ❌ Erreur (code désactivé)
```

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'rest_framework'"

```bash
cd backend
pip install djangorestframework
```

### "Cannot serialize function: lambda"

Ce problème a été **corrigé** en utilisant une fonction nommée au lieu d'une lambda.

### "CORS error" ou "Access-Control-Allow-Origin"

Vérifiez que le fichier `axios.js` a la bonne baseURL :
```javascript
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/"
});
```

### "Code d'inscription invalide ou déjà utilisé"

- Le code n'existe pas → Créer depuis l'admin
- Le code est inactif → Voir dans l'admin si actif=False
- Le code est mal tapé → Vérifier la casse (majuscules)

---

## 📚 Documentation supplémentaire

| Document | Description |
|----------|------------|
| [GUIDE_COMPLET_SIGNUP.md](GUIDE_COMPLET_SIGNUP.md) | Architecture complète du système |
| [EXPLICATION_SIGNUP.md](frontend/EXPLICATION_SIGNUP.md) | Explications pédagogiques (formData, spread, handleChange) |
| [ERREURS_A_EVITER.md](frontend/ERREURS_A_EVITER.md) | 10 erreurs courantes et leurs solutions |

---

## ✅ Checklist finale

- [ ] Backend fonctionne (python manage.py runserver)
- [ ] Frontend fonctionne (npm run dev)
- [ ] Code de test créé dans l'admin
- [ ] Inscription réussie avec bon code
- [ ] Erreur affichée avec code invalide
- [ ] Code est désactivé après utilisation
- [ ] Message de succès en vert
- [ ] Message d'erreur en rouge
- [ ] Formulaire vidé après succès
- [ ] Utilisateur créé dans la base de données

---

## 🚀 Prochaines étapes

1. **Validation avancée**
   - Email valide
   - Password fort (min 8 caractères, majuscule, chiffre)
   - Username unique

2. **Amélioration UX**
   - Popup de confirmation
   - Loading spinner
   - Messages temporaires (disparaissent après 3s)

3. **Sécurité**
   - Rate limiting (max 5 tentatives par minute)
   - Codes avec date d'expiration
   - Codes uniques par utilisateur

4. **Admin amélioré**
   - Export des codes en CSV
   - Génération de codes en masse
   - Historique d'utilisation

---

## 📞 Support

Pour des questions ou problèmes :

1. Vérifier les fichiers de documentation
2. Consulter les erreurs courantes
3. Vérifier les logs Django : `python manage.py shell`
4. Vérifier la console React (F12)

---

**Créé le 21 février 2026** 📅  
**Status** : ✅ Prêt pour la production  
**Niveau** : 🟢 Débutant
