# 🚨 Erreurs fréquentes - Ce qu'il NE FAUT PAS FAIRE

## ❌ Erreur 1 : Oublier le spread operator

### Mauvais code
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    [name]: value  // ❌ Les autres champs sont perdus !
  });
};

// Résultat après "jean" dans username :
// formData = { username: "jean" }  → email, password, code disparaissent !
```

### Bon code
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,   // ✅ Copier tous les champs
    [name]: value  // Puis mettre à jour celui-ci
  });
};

// Résultat après "jean" dans username :
// formData = { 
//   username: "jean",
//   email: "ancien@email.com",
//   password: "MdpSecret",
//   code_inscription: "A1B2"
// }
```

---

## ❌ Erreur 2 : Utiliser des états séparés

### Mauvais code
```javascript
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [code, setCode] = useState("");
// 4 appels à useState = code verbeux et répétitif !

const handleChange1 = (e) => setUsername(e.target.value);
const handleChange2 = (e) => setEmail(e.target.value);
const handleChange3 = (e) => setPassword(e.target.value);
const handleChange4 = (e) => setCode(e.target.value);
// Même fonction copiée 4 fois ! 😫

// Et après, il faut en passer 4 au backend :
await signup(username, email, password, code);
```

### Bon code
```javascript
const [formData, setFormData] = useState({
  username: "",
  email: "",
  password: "",
  code_inscription: ""
});
// 1 seul état = code simple et lisible !

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });
};
// 1 seule fonction pour tout !

// Et après, on envoie directement :
await signup(formData);
```

---

## ❌ Erreur 3 : Oublier `async/await`

### Mauvais code
```javascript
const handleSignup = () => {
  signup(formData);  // ❌ N'attend pas la réponse !
  setMessage("Succès !");  // ❌ Exécuté AVANT la réponse
};

// Résultat : 
// 1. onClick déclenché
// 2. signup() appelé (pas d'attente)
// 3. setMessage() appelé immédiatement
// 4. Puis la réponse du backend arrive (trop tard !)
```

### Bon code
```javascript
const handleSignup = async () => {
  try {
    await signup(formData);  // ✅ Attend la réponse
    setMessage("Succès !");  // ✅ Exécuté APRÈS la réponse
  } catch (err) {
    setError("Erreur");      // ✅ Capture les erreurs
  }
};

// Résultat : 
// 1. onClick déclenché
// 2. signup() appelé ET on l'attend
// 3. Réponse arrive
// 4. setMessage() appelé avec la vraie réponse
```

---

## ❌ Erreur 4 : Pas de gestion d'erreur

### Mauvais code
```javascript
const handleSignup = async () => {
  await signup(formData);
  setMessage("Succès !");
  // ❌ Pas de try/catch !
  // Si une erreur survient, le programme crash
};

// Erreur possible :
// - Code invalide → Erreur 400
// - Username existe déjà → Erreur 400
// - Pas de connexion → Erreur réseau
// → Le composant crash sans message d'erreur !
```

### Bon code
```javascript
const handleSignup = async () => {
  try {
    await signup(formData);
    setMessage("Succès !");
  } catch (err) {
    // ✅ Capturer l'erreur et l'afficher
    const errorMsg = err.response?.data?.message || "Erreur inconnue";
    setError(errorMsg);
  }
};

// Maintenant les erreurs sont affichées proprement
```

---

## ❌ Erreur 5 : Ne pas utiliser `name` dans les inputs

### Mauvais code
```javascript
<input
  placeholder="Username"
  value={formData.username}
  onChange={(e) => {
    // Comment savoir que c'est le username qui change ?
    // Impossible de réutiliser la même fonction !
    setFormData({
      ...formData,
      username: e.target.value  // ❌ Hardcodé !
    });
  }}
/>

<input
  placeholder="Email"
  value={formData.email}
  onChange={(e) => {
    // ❌ Même code avec "email" au lieu de "username"
    setFormData({
      ...formData,
      email: e.target.value
    });
  }}
/>
```

### Bon code
```javascript
<input
  name="username"  // ✅ Mettre le name !
  placeholder="Username"
  value={formData.username}
  onChange={handleChange}  // ✅ Même fonction pour tout
/>

<input
  name="email"  // ✅ Mettre le name !
  placeholder="Email"
  value={formData.email}
  onChange={handleChange}  // ✅ Même fonction pour tout
/>

// handleChange extrait name automatiquement
const handleChange = (e) => {
  const { name, value } = e.target;  // name = "username" ou "email"
  setFormData({ ...formData, [name]: value });
};
```

---

## ❌ Erreur 6 : Utiliser des variables au lieu de state

### Mauvais code
```javascript
let username = "";  // ❌ Variable simple

const handleChange = (e) => {
  username = e.target.value;  // ❌ Modifiée mais React ne sait pas
};

// Résultat : 
// - username est modifié
// - Mais React ne re-rend pas le composant
// - L'input ne met pas à jour l'affichage
// - L'utilisateur voit rien !
```

### Bon code
```javascript
const [username, setUsername] = useState("");  // ✅ Utiliser useState

const handleChange = (e) => {
  setUsername(e.target.value);  // ✅ React sait qu'il faut re-rendre
};

// Résultat : 
// - React détecte le changement
// - Le composant est re-rendu
// - L'input affiche la nouvelle valeur
// - L'utilisateur voit tout en temps réel
```

---

## ❌ Erreur 7 : Ne pas vider le formulaire après succès

### Mauvais code
```javascript
const handleSignup = async () => {
  try {
    await signup(formData);
    setMessage("Succès !");
    // ❌ Le formulaire n'est pas vidé
    // Les données sont encore là
  } catch (err) {
    setError("Erreur");
  }
};

// Résultat : 
// - Utilisateur voit "Succès !"
// - Mais les données sont encore dans les inputs
// - Il peut cliquer "Créer le compte" encore
// - Code va être utilisé 2 fois !
```

### Bon code
```javascript
const handleSignup = async () => {
  try {
    await signup(formData);
    setMessage("Succès !");
    
    // ✅ Vider le formulaire
    setFormData({
      username: "",
      email: "",
      password: "",
      code_inscription: ""
    });
  } catch (err) {
    setError("Erreur");
  }
};

// Résultat : 
// - Utilisateur voit "Succès !"
// - Les inputs sont vides
// - Il faut remplir un nouveau formulaire
// - Impossible de réutiliser par erreur
```

---

## ❌ Erreur 8 : Afficher l'erreur mais pas la vider

### Mauvais code
```javascript
const handleSignup = async () => {
  try {
    await signup(formData);
    setMessage("Succès !");
    // ❌ L'erreur précédente ne disparaît pas
  } catch (err) {
    setError("Code invalide");
  }
};

// Résultat : 
// 1. Première tentative avec code invalide
//    Affiche "❌ Code invalide"
// 2. Utilisateur entre un bon code
// 3. Clique "Créer le compte"
// 4. Succès ! Affiche "✅ Succès"
// 5. Mais aussi "❌ Code invalide" reste visible !
```

### Bon code
```javascript
const handleSignup = async () => {
  setError("");      // ✅ Vider avant de commencer
  setMessage("");
  
  try {
    await signup(formData);
    setMessage("Succès !");
  } catch (err) {
    setError("Code invalide");
  }
};

// Résultat : 
// - Chaque nouvelle tentative efface les anciens messages
// - Un seul message visible à la fois
// - Plus clair pour l'utilisateur
```

---

## ❌ Erreur 9 : Passer directement des objets au click

### Mauvais code
```javascript
<button onClick={handleSignup(formData)}>  // ❌ ERREUR !
  Créer le compte
</button>

// Pourquoi c'est mal :
// - handleSignup(formData) est appelé IMMÉDIATEMENT
// - Pas au click, mais au rendu du composant
// - Le formulaire s'envoie 50 fois à la seconde !
// - Le serveur reçoit 1000 demandes d'inscription
```

### Bon code
```javascript
<button onClick={() => handleSignup()}>  // ✅ Fonction anonyme
  Créer le compte
</button>

// Ou :
<button onClick={handleSignup}>  // ✅ Référence à la fonction
  Créer le compte
</button>

// Pourquoi c'est bon :
// - handleSignup() n'est appelé QUE au click
// - Une fois par click = normal
// - Le formulaire s'envoie une seule fois
```

---

## ❌ Erreur 10 : Ne pas vérifier les données du backend

### Mauvais code
```javascript
const handleSignup = async () => {
  try {
    await signup(formData);
    setMessage("Succès !");  // ✅ Bon
  } catch (err) {
    setError("Erreur");      // ❌ Message trop générique
  }
};

// Utilisateur voit "Erreur" sans savoir c'est quoi
// Code invalide ? Username existe ? Email invalide ?
// Il ne sait pas !
```

### Bon code
```javascript
const handleSignup = async () => {
  try {
    await signup(formData);
    setMessage("Succès !");
  } catch (err) {
    // ✅ Extraire le message du backend
    const errorMsg = 
      err.response?.data?.message ||                    // Message général
      err.response?.data?.non_field_errors?.[0] ||     // Erreur globale
      err.response?.data?.code_inscription?.[0] ||     // Erreur du code
      err.response?.data?.username?.[0] ||             // Erreur du username
      "Erreur lors de l'inscription";                  // Défaut
    
    setError(errorMsg);
  }
};

// Utilisateur voit :
// - "Code d'inscription invalide ou déjà utilisé"
// - "Cet identifiant est déjà utilisé"
// - "Entrez une adresse email valide"
// - Plus clair et utile !
```

---

## 📊 Tableau récapitulatif

| Erreur | Cause | Solution |
|--------|-------|----------|
| Champs disparaissent | Pas de spread | Ajouter `...formData` |
| Code répété 4 fois | États séparés | Un seul état `formData` |
| Succès avant la réponse | Pas d'await | Ajouter `async/await` |
| Le composant crash | Pas de try/catch | Ajouter `try/catch` |
| Impossible de réutiliser handleChange | Pas de `name` | Ajouter `name=` sur les inputs |
| L'input ne change pas visuellement | Variable simple | Utiliser `useState` |
| Code réutilisé | Formulaire non vidé | Vider après succès |
| Messages mélangés | Erreurs pas effacées | Effacer avant chaque tentative |
| Spam de requêtes | onClick avec appel direct | Utiliser arrow function ou référence |
| Utilisateur confus | Message générique | Afficher message du backend |

---

## 💡 Règles à retenir

1. **Toujours spread** : `...formData` avant de modifier
2. **Un seul état** : Regrouper les champs liés
3. **Toujours async/await** : Attendre les réponses réseau
4. **Toujours try/catch** : Gérer les erreurs
5. **Toujours name=** : Sur tous les inputs
6. **Toujours useState** : Pour l'état du composant
7. **Toujours vider** : Après succès
8. **Toujours effacer** : Les anciens messages
9. **Jamais d'appel direct** : Au onClick
10. **Toujours détailler** : Les messages d'erreur

---

**Créé le 21 février 2026** 📅
