# 📄 GUIDE D'ADAPTATION DES PAGES À L'API

## 📋 APERÇU

Ce guide explique **comment adapter chaque page existante** pour utiliser les **vraies données de l'API Django** au lieu des données simulées.

---

## 🔄 PROCESSUS GÉNÉRAL

### Avant (Données simulées)
```javascript
const [data, setData] = useState([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
]);
```

### Après (Données réelles)
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await apiService.getData();
      const items = Array.isArray(response) ? response : response.results;
      setData(items);
    } catch (error) {
      setError(error.message);
    }
  };
  fetchData();
}, []);
```

---

## 🧑‍🎓 PAGES PAR RÔLE

### ✨ TABLEAU RÉCAPITULATIF

| Page | Rôle | Service | Endpoints |
|------|------|---------|-----------|
| Dashboard | Tous | academicService | /me/, /annees-academiques/ |
| StudentGrades | Étudiant | gradeService | /etudiants/mes_notes/ |
| TeacherGradeEntry | Enseignant | gradeService, studentService | /matieres/, /etudiants/ |
| SupervisorResults | Superviseur | gradeService | /matieres/ |
| AdminStudents | Admin | studentService | /etudiants/ |
| AdminCourses | Admin | academicService | /ues/ |
| AdminSemesters | Admin | academicService | /semestres/ |
| AdminYears | Admin | academicService | /annees-academiques/ |

---

## 🛠️ ADAPTATION DÉTAILLÉE

### 1️⃣ Page Dashboard

**Objectif:** Afficher les statistiques générales

**Données réelles à charger:**
```javascript
// Utilisateur courant
const { user } = useAuth();

// Année académique active
import * as academicService from '../api/academicService';
const currentYear = await academicService.getCurrentAcademicYear();

// Statistiques de notes
import * as gradeService from '../api/gradeService';
const stats = await gradeService.getGradeStatistics();
```

**Code complet:**
```jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as gradeService from '../api/gradeService';
import * as academicService from '../api/academicService';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, yearData] = await Promise.all([
          gradeService.getGradeStatistics(),
          academicService.getCurrentAcademicYear(),
        ]);
        setStats(statsData);
        setCurrentYear(yearData);
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Bienvenue {user?.username}</h1>
      <p>Année: {currentYear?.libelle}</p>
      <div className="stats">
        <p>Moyenne: {stats?.statistiques?.moyenne_generale}</p>
        <p>Taux de réussite: {stats?.taux_reussite}%</p>
      </div>
    </div>
  );
}

export default Dashboard;
```

---

### 2️⃣ Page StudentGrades

**Voir le fichier:** `StudentGrades_INTÉGRÉ.jsx`

**Points clés:**
- ✅ Utilise `gradeService.getMyGrades()`
- ✅ Gère les deux formats (array et paginated)
- ✅ Affiche vraies données avec vraies colonnes
- ✅ Gestion d'erreurs complète
- ✅ Loading state

---

### 3️⃣ Page TeacherGradeEntry

**Objectif:** Enseignant saisit les notes

**Services utilisés:**
```javascript
import * as studentService from '../api/studentService';
import * as gradeService from '../api/gradeService';

// 1. Charger les étudiants
const students = await studentService.getAllStudents();

// 2. Charger les notes existantes
const grades = await gradeService.getStudentGrades(studentId);

// 3. Créer/modifier une note
await gradeService.updateGrade(gradeId, {
  devoir: 14,
  examen: 16,
});
```

**Template:**
```jsx
import { useState, useEffect } from 'react';
import * as studentService from '../api/studentService';
import * as gradeService from '../api/gradeService';

function TeacherGradeEntry() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les étudiants
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentService.getAllStudents();
        const studentsList = Array.isArray(data) ? data : data.results;
        setStudents(studentsList);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Charger notes quand étudiant sélectionné
  useEffect(() => {
    if (!selectedStudent) return;

    const fetchGrades = async () => {
      try {
        const data = await gradeService.getStudentGrades(selectedStudent.id);
        const gradesList = Array.isArray(data) ? data : data.results;
        setGrades(gradesList);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchGrades();
  }, [selectedStudent]);

  // Mise à jour note
  const handleGradeChange = async (gradeId, field, value) => {
    try {
      await gradeService.updateGrade(gradeId, {
        [field]: parseFloat(value),
      });
      // Recharger les notes
      const data = await gradeService.getStudentGrades(selectedStudent.id);
      const gradesList = Array.isArray(data) ? data : data.results;
      setGrades(gradesList);
    } catch (error) {
      alert('Erreur lors de la mise à jour: ' + error.message);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Saisie des Notes</h1>
      
      {/* Sélection étudiant */}
      <select
        onChange={(e) => {
          const student = students.find(s => s.id === parseInt(e.target.value));
          setSelectedStudent(student);
        }}
      >
        <option>Sélectionner un étudiant</option>
        {students.map(s => (
          <option key={s.id} value={s.id}>
            {s.nom} {s.prenom}
          </option>
        ))}
      </select>

      {/* Table de notes */}
      {selectedStudent && (
        <table>
          <thead>
            <tr>
              <th>UE</th>
              <th>Devoir</th>
              <th>Examen</th>
              <th>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {grades.map(grade => (
              <tr key={grade.id}>
                <td>{grade.ue_libelle}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    defaultValue={grade.devoir}
                    onChange={(e) => handleGradeChange(grade.id, 'devoir', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    defaultValue={grade.examen}
                    onChange={(e) => handleGradeChange(grade.id, 'examen', e.target.value)}
                  />
                </td>
                <td>{grade.moyenne?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeacherGradeEntry;
```

---

### 4️⃣ Page SupervisorResults

**Objectif:** Superviseur consulte les résultats filtrés

```jsx
import { useState, useEffect } from 'react';
import * as gradeService from '../api/gradeService';
import * as academicService from '../api/academicService';

function SupervisorResults() {
  const [results, setResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    semestre: '',
    ue: '',
    resultat: '',
  });

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [semData, courseData] = await Promise.all([
          academicService.getSemesters(),
          academicService.getCourses(),
        ]);
        setSemesters(Array.isArray(semData) ? semData : semData.results);
        setCourses(Array.isArray(courseData) ? courseData : courseData.results);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchData();
  }, []);

  // Charger résultats avec filtres
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await gradeService.getGrades(filters);
        setResults(Array.isArray(data) ? data : data.results);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchResults();
  }, [filters]);

  return (
    <div>
      <h1>Résultats des Étudiants</h1>
      
      {/* Filtres */}
      <div className="filters">
        <select
          value={filters.semestre}
          onChange={(e) => setFilters({...filters, semestre: e.target.value})}
        >
          <option value="">Tous les semestres</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.numero}</option>
          ))}
        </select>

        <select
          value={filters.ue}
          onChange={(e) => setFilters({...filters, ue: e.target.value})}
        >
          <option value="">Tous les cours</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.libelle}</option>
          ))}
        </select>

        <select
          value={filters.resultat}
          onChange={(e) => setFilters({...filters, resultat: e.target.value})}
        >
          <option value="">Tous les résultats</option>
          <option value="V">Validé</option>
          <option value="NV">Non validé</option>
        </select>
      </div>

      {/* Résultats */}
      <table>
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>UE</th>
            <th>Moyenne</th>
            <th>Résultat</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r => (
            <tr key={r.id}>
              <td>{r.etudiant_nom} {r.etudiant_prenom}</td>
              <td>{r.ue_libelle}</td>
              <td>{r.moyenne?.toFixed(2)}</td>
              <td>{r.resultat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SupervisorResults;
```

---

### 5️⃣ Pages Admin (CRUD)

**Pattern général pour admin pages:**

```jsx
import { useState, useEffect } from 'react';
import * as adminService from '../api/academicService'; // ou studentService

function AdminYears() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Charger
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminService.getAcademicYears();
        setItems(Array.isArray(data) ? data : data.results);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetch();
  }, []);

  // Créer
  const handleCreate = async () => {
    try {
      await adminService.createAcademicYear(form);
      // Recharger la liste
      const data = await adminService.getAcademicYears();
      setItems(Array.isArray(data) ? data : data.results);
      setForm({});
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // Modifier
  const handleUpdate = async () => {
    try {
      await adminService.updateAcademicYear(editingId, form);
      const data = await adminService.getAcademicYears();
      setItems(Array.isArray(data) ? data : data.results);
      setEditingId(null);
      setForm({});
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (!confirm('Confirmez suppression?')) return;
    try {
      await adminService.deleteAcademicYear(id);
      setItems(items.filter(i => i.id !== id));
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  return (
    <div>
      <h1>Gestion des Années</h1>

      {/* Formulaire */}
      <form onSubmit={(e) => {
        e.preventDefault();
        editingId ? handleUpdate() : handleCreate();
      }}>
        <input
          placeholder="Libellé"
          value={form.libelle || ''}
          onChange={(e) => setForm({...form, libelle: e.target.value})}
        />
        <input
          type="date"
          value={form.date_debut || ''}
          onChange={(e) => setForm({...form, date_debut: e.target.value})}
        />
        <button type="submit">
          {editingId ? 'Modifier' : 'Créer'}
        </button>
      </form>

      {/* Liste */}
      <table>
        <thead>
          <tr>
            <th>Libellé</th>
            <th>Début</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.libelle}</td>
              <td>{item.date_debut}</td>
              <td>
                <button onClick={() => {
                  setEditingId(item.id);
                  setForm(item);
                }}>Éditer</button>
                <button onClick={() => handleDelete(item.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminYears;
```

---

## 🔑 POINTS CLÉS D'ADAPTATION

### ✅ Choses à faire

1. **Importer les services:**
   ```javascript
   import * as gradeService from '../api/gradeService';
   import * as studentService from '../api/studentService';
   import * as academicService from '../api/academicService';
   import * as authService from '../api/authService';
   ```

2. **Gérer les deux formats de réponse:**
   ```javascript
   const data = Array.isArray(response) ? response : response.results;
   ```

3. **Ajouter loading et error states:**
   ```javascript
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   ```

4. **Utiliser useEffect pour fetch:**
   ```javascript
   useEffect(() => {
     // fetch au montage
   }, []);
   ```

5. **Gérer les erreurs:**
   ```javascript
   try { ... } catch (err) { setError(err.message); }
   ```

### ❌ À éviter

- ❌ Données codées en dur
- ❌ Pas de loading state
- ❌ Pas de gestion d'erreurs
- ❌ Appels API non utilisés
- ❌ Refresh page au lieu de setState
- ❌ localStorage au lieu des services

---

## 🧪 TESTER L'ADAPTATION

### Checklist pour chaque page

- [ ] API call s'exécute au montage
- [ ] Loading state affiché pendant chargement
- [ ] Données affichées correctement
- [ ] Erreurs gérées et affichées
- [ ] Formulaires créent/modifient via API
- [ ] Suppressions demandent confirmation
- [ ] Permissions vérifiées (hasRole)
- [ ] Pas d'erreurs console

---

## 📞 AIDE

**Q: Comment déboguer?**
A: Ouvrir DevTools (F12) > Network > voir les requêtes API

**Q: Comment vérifier les réponses?**
A: Network > cliquer sur la requête > Response tab

**Q: Comment tester sans Django?**
A: Mock les services avec des données de test

---

## ✨ CONCLUSION

Utilisez ces patterns pour adapter **toutes les pages** de la même manière!

Besoin d'aide? Référez-vous à `StudentGrades_INTÉGRÉ.jsx` qui contient un exemple complet.
