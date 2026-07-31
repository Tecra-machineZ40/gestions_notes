import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createUser, deleteUser, getAdminAuditLogs, getUsers, setUserPassword, updateUser } from "../../api/userService";
import { normalizeRole } from "../../utils/roles";
import { getStatusLabel } from "../../utils/statusMapper";
import {
  getAcademicYears,
  getCourses,
  getMyTeachingCourses,
  getMyTeachingSubjects,
  getSemesters,
  getSessions,
} from "../../api/academicService";
import { createGrade, deleteGrade, getAcademicSubjects, getGradeStatistics, getGrades, getStudentSemesterResults, getStudentUEResults, getSemesterResults, getUEResults, recalculateAverages, updateGrade } from "../../api/gradeService";
import {
  getAllStudents,
  getMyGrades,
  getMyProfile,
  getMySupervisorProfile,
  getMyTeacherProfile,
  updateMyProfile,
  updateMySupervisorProfile,
  updateMyTeacherProfile,
} from "../../api/studentService";

const roleLabels = {
  admin: "Administrateur",
  teacher: "Enseignant",
  student: "Étudiant",
  supervisor: "Superviseur",
};

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return [];
};

const mean = (values) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("fr-FR");
};

const getGradeValue = (grade) => Number.parseFloat(grade?.moyenne ?? 0) || 0;

const uniqBy = (items, keyBuilder) => {
  const cache = new Map();

  items.forEach((item) => {
    const key = keyBuilder(item);
    if (key !== null && key !== undefined && key !== "") {
      cache.set(key, item);
    }
  });

  return Array.from(cache.values());
};

function useAsyncResource(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await loader();
        if (isActive) {
          setData(result);
        }
      } catch (err) {
        if (isActive) {
          setError(err?.response?.data?.detail || err?.message || "Impossible de charger les données.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      isActive = false;
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, setData };
}

function SectionLayout({ title, description, loading, error, actions, children }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>

      {loading ? (
        <div className="bg-white border border-blue-700 p-8 rounded-none text-slate-500">Chargement...</div>
      ) : null}

      {error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-none text-sm text-red-700">{error}</div>
      ) : null}

      {!loading ? children : null}
    </div>
  );
}

function StatsGrid({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white border border-blue-700 p-5 rounded-none">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">{item.label}</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</div>
          {item.helper ? <div className="mt-2 text-sm text-slate-500">{item.helper}</div> : null}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return <div className="bg-white border border-blue-700 p-8 rounded-none text-center text-slate-500">{message}</div>;
}

function DataTable({ columns, rows, emptyMessage = "Aucune donnée disponible." }) {
  if (!rows.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="bg-white border border-blue-700 rounded-none overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-[0.25em]"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, index) => (
              <tr key={row.id || `${index}-${columns[0]?.key || "row"}`} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-slate-900 align-top">
                    {column.render ? column.render(row) : row[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OverviewRecentGrades({ grades }) {
  const recentGrades = [...grades]
    .sort((a, b) => new Date(b.date_modification || b.date_creation || 0) - new Date(a.date_modification || a.date_creation || 0))
    .slice(0, 6);

  if (!recentGrades.length) {
    return <EmptyState message="Aucune activité récente à afficher." />;
  }

  return (
    <div className="bg-white border border-blue-700 rounded-none">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Activité récente</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {recentGrades.map((grade) => (
          <div key={grade.id} className="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-slate-900">
                {grade.ue_libelle || grade.ue_str || "Note"} - {grade.etudiant_nom ? `${grade.etudiant_prenom} ${grade.etudiant_nom}` : grade.etudiant_str || "Étudiant"}
              </div>
              <div className="text-sm text-slate-500">
                Session {grade.session_libelle || "—"} • Semestre {grade.semestre_numero || "—"}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900">{getGradeValue(grade).toFixed(2)}/20</div>
              <div className="text-xs text-slate-500">{formatDate(grade.date_modification || grade.date_creation)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardOverview({ userRole }) {
  const { user } = useAuth();
  const normalizedRole = normalizeRole(userRole);
  const { data, loading, error } = useAsyncResource(async () => {
    if (normalizedRole === "admin") {
      const [users, students, courses, grades] = await Promise.all([
        getUsers(),
        getAllStudents(),
        getCourses(),
        getGrades(),
      ]);

      return {
        users: normalizeList(users),
        students: normalizeList(students),
        courses: normalizeList(courses),
        grades: normalizeList(grades),
      };
    }

    if (normalizedRole === "teacher") {
      const [courses, students, grades] = await Promise.all([
        getMyTeachingCourses(),
        getAllStudents(),
        getGrades(),
      ]);

      const teacherCourses = normalizeList(courses);
      const courseIds = new Set(teacherCourses.map((course) => course.id));
      const teacherGrades = normalizeList(grades).filter((grade) => courseIds.has(grade.ue));

      return {
        courses: teacherCourses,
        students: normalizeList(students),
        grades: teacherGrades,
      };
    }

    if (normalizedRole === "student") {
      const [profile, grades] = await Promise.all([getMyProfile(), getMyGrades()]);
      return {
        profile,
        grades: normalizeList(grades),
      };
    }

    const [users, students, grades, statistics] = await Promise.all([
      getUsers(),
      getAllStudents(),
      getGrades(),
      getGradeStatistics().catch(() => null),
    ]);

    return {
      users: normalizeList(users),
      students: normalizeList(students),
      grades: normalizeList(grades),
      statistics,
    };
  }, [normalizedRole]);

  const stats = useMemo(() => {
    if (!data) {
      return [];
    }

    if (normalizedRole === "admin") {
      const teachers = data.users.filter((item) => item.role === "teacher");
      return [
        { label: "Utilisateurs", value: data.users.length },
        { label: "Étudiants", value: data.students.length },
        { label: "UE", value: data.courses.length },
        { label: "Notes", value: data.grades.length },
        { label: "Enseignants", value: teachers.length },
        { label: "Moyenne globale", value: `${mean(data.grades.map(getGradeValue)).toFixed(2)}/20` },
      ];
    }

    if (normalizedRole === "teacher") {
      const studentIds = new Set(data.grades.map((grade) => grade.etudiant));
      return [
        { label: "Mes UE", value: data.courses.length },
        { label: "Étudiants suivis", value: studentIds.size },
        { label: "Notes saisies", value: data.grades.length },
        { label: "Moyenne des notes", value: `${mean(data.grades.map(getGradeValue)).toFixed(2)}/20` },
      ];
    }

    if (normalizedRole === "student") {
      const passed = data.grades.filter((grade) => getGradeValue(grade) >= 10).length;
      return [
        { label: "Nom", value: `${data.profile?.prenom || ""} ${data.profile?.nom || ""}`.trim() || user?.username || "—" },
        { label: "Matricule", value: data.profile?.matricule || "—" },
        { label: "Mes notes", value: data.grades.length },
        { label: "Moyenne", value: `${mean(data.grades.map(getGradeValue)).toFixed(2)}/20` },
        { label: "Validées", value: passed },
      ];
    }

    const teachers = data.users.filter((item) => item.role === "teacher");
    return [
      { label: "Enseignants", value: teachers.length },
      { label: "Étudiants", value: data.students.length },
      { label: "Notes à surveiller", value: data.grades.filter((grade) => getGradeValue(grade) < 10).length },
      {
        label: "Taux de réussite",
        value: `${data.grades.length ? Math.round((data.grades.filter((grade) => getGradeValue(grade) >= 10).length / data.grades.length) * 100) : 0}%`,
      },
    ];
  }, [data, normalizedRole, user?.username]);

  const grades = data?.grades || [];

  return (
    <SectionLayout
      title="Tableau de bord"
      description={`Bienvenue ${user?.username || "utilisateur"}, voici un aperçu de votre espace ${roleLabels[normalizedRole] || ""}.`}
      loading={loading}
      error={error}
    >
      <StatsGrid items={stats} />
      <OverviewRecentGrades grades={grades} />
    </SectionLayout>
  );
}

export function UsersManagement() {
  const { user, startImpersonation, isImpersonating } = useAuth();
  const { data, loading, error, setData } = useAsyncResource(async () => normalizeList(await getUsers()), []);
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const getUserRole = (user) => normalizeRole(user?.role);
  const getUserRoleLabel = (user) => roleLabels[getUserRole(user)] || user?.role || "—";
  const isAdmin = ["admin", "administrateur"].includes(user?.role);

  const syncRow = (updatedUser) => {
    setData((current) => (current || []).map((row) => (row.id === updatedUser.id ? updatedUser : row)));
  };

  const removeRow = (deletedId) => {
    setData((current) => (current || []).filter((row) => row.id !== deletedId));
  };

  const appendRow = (newRow) => {
    setData((current) => [newRow, ...(current || [])]);
  };

  const handleCreate = async () => {
    const username = window.prompt("Nom d'utilisateur :");
    if (!username) return;

    const password = window.prompt("Mot de passe (min 6 caractères) :");
    if (!password) return;

    const email = window.prompt("Email :") || "";
    const role = window.prompt("Rôle (administrateur, enseignant, etudiant, superviseur) :", "etudiant") || "etudiant";

    try {
      setActionError("");
      const created = await createUser({ username, password, email, role });
      appendRow(created);
      setActionMessage("Utilisateur créé avec succès.");
    } catch (err) {
      setActionError(err?.response?.data?.detail || err?.message || "Création impossible.");
    }
  };

  const handleEdit = async (target) => {
    const email = window.prompt("Nouvel email :", target.email || "");
    if (email === null) return;

    const first_name = window.prompt("Prénom :", target.first_name || "");
    if (first_name === null) return;

    const last_name = window.prompt("Nom :", target.last_name || "");
    if (last_name === null) return;

    const role = window.prompt("Rôle (administrateur, enseignant, etudiant, superviseur) :", target.role || "etudiant");
    if (role === null) return;

    try {
      setActionError("");
      const updated = await updateUser(target.id, { email, first_name, last_name, role });
      syncRow(updated);
      setActionMessage("Utilisateur mis à jour.");
    } catch (err) {
      setActionError(err?.response?.data?.detail || err?.message || "Mise à jour impossible.");
    }
  };

  const handleToggleActive = async (target) => {
    try {
      setActionError("");
      const updated = await updateUser(target.id, { is_active: !target.is_active });
      syncRow(updated);
      setActionMessage(`Compte ${updated.is_active ? "activé" : "désactivé"}.`);
    } catch (err) {
      setActionError(err?.response?.data?.detail || err?.message || "Mise à jour du statut impossible.");
    }
  };

  const handleToggleAccountActivation = async (target) => {
    try {
      setActionError("");
      const updated = await updateUser(target.id, { compte_active: !target.compte_active });
      syncRow(updated);
      setActionMessage(`Compte applicatif ${updated.compte_active ? "activé" : "désactivé"}.`);
    } catch (err) {
      setActionError(err?.response?.data?.detail || err?.message || "Activation du compte impossible.");
    }
  };

  const handleResetPassword = async (target) => {
    const password = window.prompt(`Nouveau mot de passe pour ${target.username} :`);
    if (!password) return;

    try {
      setActionError("");
      await setUserPassword(target.id, password);
      setActionMessage("Mot de passe mis à jour.");
    } catch (err) {
      setActionError(err?.response?.data?.detail || err?.message || "Réinitialisation impossible.");
    }
  };

  const handleDelete = async (target) => {
    if (!window.confirm(`Supprimer le compte ${target.username} ?`)) return;

    try {
      setActionError("");
      await deleteUser(target.id);
      removeRow(target.id);
      setActionMessage("Utilisateur supprimé.");
    } catch (err) {
      setActionError(err?.response?.data?.detail || err?.message || "Suppression impossible.");
    }
  };

  const handleImpersonate = async (target) => {
    if (!window.confirm(`Basculer vers le compte ${target.username} (${target.role}) ?`)) return;

    try {
      setActionError("");
      await startImpersonation(target.id);
      setActionMessage(`Impersonation active: ${target.username}.`);
      // Toujours arriver sur une page autorisée du rôle impersoné.
      window.location.href = "/dashboard?page=dashboard";
    } catch (err) {
      setActionError(err?.response?.data?.detail || err?.message || "Impersonation impossible.");
    }
  };

  const rows = useMemo(() => {
    if (!data) {
      return [];
    }

    const query = search.trim().toLowerCase();
    if (!query) {
      return data;
    }

    return data.filter((user) =>
      [user.username, user.email, user.first_name, user.last_name, getUserRoleLabel(user)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [data, search]);

  return (
    <SectionLayout
      title="Gestion des utilisateurs"
      description="Liste complète des comptes présents dans la plateforme."
      loading={loading}
      error={error}
      actions={
        <>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un utilisateur"
            className="px-4 py-2 border border-slate-300 bg-white rounded-none"
          />
          {isAdmin ? (
            <button type="button" onClick={handleCreate} className="px-4 py-2 bg-blue-700 text-white border border-blue-700 rounded-none">
              + Nouvel utilisateur
            </button>
          ) : null}
        </>
      }
    >
      {actionMessage ? <div className="text-sm text-green-700">{actionMessage}</div> : null}
      {actionError ? <div className="text-sm text-red-700">{actionError}</div> : null}
      <StatsGrid
        items={[
          { label: "Total", value: rows.length },
          { label: "Admins", value: rows.filter((user) => getUserRole(user) === "admin").length },
          { label: "Enseignants", value: rows.filter((user) => getUserRole(user) === "teacher").length },
          { label: "Étudiants", value: rows.filter((user) => user.role === "student").length },
        ]}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "username", label: "Utilisateur" },
          { key: "email", label: "Email" },
          {
            key: "full_name",
            label: "Nom complet",
            render: (user) => `${user.first_name || ""} ${user.last_name || ""}`.trim() || "—",
          },
          {
            key: "role",
            label: "Rôle",
            render: (user) => roleLabels[user.role] || user.role,
          },
          {
            key: "is_active",
            label: "Statut",
            render: (user) => (user.is_active ? "Actif" : "Inactif"),
          },
          {
            key: "compte_active",
            label: "Compte",
            render: (row) => (row.compte_active ? "Activé" : "En attente"),
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              isAdmin ? (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleEdit(row)} className="px-2 py-1 text-xs border border-slate-300 bg-white">
                    Modifier
                  </button>
                  <button type="button" onClick={() => handleToggleActive(row)} className="px-2 py-1 text-xs border border-slate-300 bg-white">
                    {row.is_active ? "Désactiver" : "Activer"}
                  </button>
                  <button type="button" onClick={() => handleToggleAccountActivation(row)} className="px-2 py-1 text-xs border border-slate-300 bg-white">
                    {row.compte_active ? "Compte OFF" : "Compte ON"}
                  </button>
                  <button type="button" onClick={() => handleResetPassword(row)} className="px-2 py-1 text-xs border border-slate-300 bg-white">
                    MDP
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImpersonate(row)}
                    className="px-2 py-1 text-xs border border-blue-700 text-blue-700 bg-white"
                    disabled={isImpersonating || row.id === user?.id}
                    title={row.id === user?.id ? "Vous êtes déjà connecté avec ce compte." : "Prendre ce rôle"}
                  >
                    Agir comme
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    className="px-2 py-1 text-xs border border-red-700 text-red-700 bg-white"
                    disabled={row.id === user?.id}
                    title={row.id === user?.id ? "Suppression de votre compte interdite." : "Supprimer"}
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                "—"
              ),
          },
        ]}
        emptyMessage="Aucun utilisateur trouvé."
      />
    </SectionLayout>
  );
}

export function AdminAuditLogsView() {
  const { data, loading, error } = useAsyncResource(async () => normalizeList(await getAdminAuditLogs()), []);
  const rows = data || [];

  return (
    <SectionLayout
      title="Journal d'audit admin"
      description="Traçabilité des actions sensibles (CRUD, mot de passe, impersonation)."
      loading={loading}
      error={error}
    >
      <StatsGrid
        items={[
          { label: "Entrées", value: rows.length },
          { label: "Impersonations", value: rows.filter((row) => row.action === "IMPERSONATE").length },
          { label: "Mises à jour", value: rows.filter((row) => row.action === "UPDATE").length },
        ]}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "created_at", label: "Date", render: (row) => formatDate(row.created_at) },
          { key: "actor_username", label: "Admin" },
          { key: "target_username", label: "Cible" },
          { key: "action", label: "Action" },
          { key: "resource_type", label: "Ressource" },
          { key: "resource_id", label: "ID" },
        ]}
        emptyMessage="Aucun log d'audit pour le moment."
      />
    </SectionLayout>
  );
}

function GenericResourcePage({ title, description, loader, columns, statsBuilder, emptyMessage = "Aucune donnée." }) {
  const { data, loading, error } = useAsyncResource(async () => normalizeList(await loader()), []);
  const rows = data || [];

  return (
    <SectionLayout title={title} description={description} loading={loading} error={error}>
      {statsBuilder ? <StatsGrid items={statsBuilder(rows)} /> : null}
      <DataTable rows={rows} columns={columns} emptyMessage={emptyMessage} />
    </SectionLayout>
  );
}

export function StudentsManagement() {
  return (
    <GenericResourcePage
      title="Gestion des étudiants"
      description="Données étudiants récupérées depuis l'API Django."
      loader={getAllStudents}
      statsBuilder={(rows) => [
        { label: "Étudiants", value: rows.length },
        { label: "Avec email", value: rows.filter((row) => row.email).length },
        { label: "Matricules", value: rows.filter((row) => row.matricule).length },
      ]}
      columns={[
        { key: "matricule", label: "Matricule" },
        {
          key: "nom_complet",
          label: "Nom",
          render: (row) => `${row.prenom || ""} ${row.nom || ""}`.trim() || "—",
        },
        { key: "email", label: "Email" },
        { key: "telephone", label: "Téléphone" },
        { key: "date_inscription", label: "Inscription", render: (row) => formatDate(row.date_inscription) },
      ]}
      emptyMessage="Aucun étudiant disponible."
    />
  );
}

export function CoursesManagement() {
  const { data, loading, error } = useAsyncResource(async () => normalizeList(await getCourses()), []);
  const rows = data || [];

  return (
    <SectionLayout title="Unités d'enseignement" description="Catalogue des UE et de leurs responsables." loading={loading} error={error}>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-700 rounded text-red-900">
          <p className="font-semibold">Erreur de chargement:</p>
          <p>{error}</p>
        </div>
      )}
      {!loading && rows.length === 0 && !error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-700 rounded text-yellow-900">
          <p>Aucune UE disponible. Vérifiez que vous avez les bonnes permissions.</p>
        </div>
      )}
      <StatsGrid items={[
        { label: "UE", value: rows.length },
        { label: "Classes liées", value: uniqBy(rows, (row) => row.classe || row.classe_nom).length },
        { label: "Semestres liés", value: uniqBy(rows, (row) => row.semestre || row.semestre_numero).length },
      ]} />
      <DataTable rows={rows} columns={[
        { key: "code_ue", label: "Code" },
        { key: "libelle", label: "Libellé" },
        { key: "classe_nom", label: "Classe", render: (row) => row.classe_nom || "Classe non renseignée" },
        { key: "semestre_numero", label: "Semestre", render: (row) => row.semestre_numero ? `Semestre ${row.semestre_numero}` : "Semestre non renseigné" },
      ]} emptyMessage="Aucune UE disponible." />
    </SectionLayout>
  );
}

export function SemestersManagement() {
  return (
    <GenericResourcePage
      title="Semestres"
      description="Périodes académiques actuellement connues."
      loader={getSemesters}
      statsBuilder={(rows) => [
        { label: "Semestres", value: rows.length },
        { label: "Années liées", value: uniqBy(rows, (row) => row.annee_academique).length },
      ]}
      columns={[
        { key: "numero", label: "Numéro", render: (row) => row.numero ? `Semestre ${row.numero}` : "Numéro non renseigné" },
        {
          key: "annee_academique_libelle",
          label: "Année académique",
          render: (row) => row.annee_academique_libelle || (row.annee_academique ? `ID ${row.annee_academique}` : "Année non renseignée"),
        },
        { key: "date_debut", label: "Début", render: (row) => row.date_debut ? formatDate(row.date_debut) : "Date non renseignée" },
        { key: "date_fin", label: "Fin", render: (row) => row.date_fin ? formatDate(row.date_fin) : "Date non renseignée" },
      ]}
      emptyMessage="Aucun semestre disponible."
    />
  );
}

export function YearsManagement() {
  return (
    <GenericResourcePage
      title="Années académiques"
      description="Référentiel des années académiques."
      loader={getAcademicYears}
      statsBuilder={(rows) => [
        { label: "Années", value: rows.length },
        { label: "Actives", value: rows.filter((row) => row.active).length },
      ]}
      columns={[
        { key: "libelle", label: "Libellé" },
        { key: "date_debut", label: "Début", render: (row) => formatDate(row.date_debut) },
        { key: "date_fin", label: "Fin", render: (row) => formatDate(row.date_fin) },
        { key: "active", label: "Statut", render: (row) => (row.active ? "Active" : "Inactive") },
      ]}
      emptyMessage="Aucune année académique disponible."
    />
  );
}

export function GradesManagement() {
  return (
    <GenericResourcePage
      title="Gestion des notes"
      description="Toutes les notes remontées par l'API."
      loader={getGrades}
      statsBuilder={(rows) => [
        { label: "Notes", value: rows.length },
        { label: "Moyenne", value: `${mean(rows.map(getGradeValue)).toFixed(2)}/20` },
        { label: "En échec", value: rows.filter((row) => getGradeValue(row) < 10).length },
      ]}
      columns={[
        {
          key: "student",
          label: "Étudiant",
          render: (row) => `${row.etudiant_prenom || ""} ${row.etudiant_nom || ""}`.trim() || "—",
        },
        { key: "ue_libelle", label: "UE" },
        { key: "semestre_numero", label: "Semestre" },
        { key: "session_libelle", label: "Session" },
        { key: "devoir", label: "Devoir" },
        { key: "examen", label: "Examen" },
        { key: "moyenne", label: "Moyenne" },
        { key: "resultat", label: "Résultat" },
      ]}
      emptyMessage="Aucune note disponible."
    />
  );
}

export function StatisticsView() {
  const { data, loading, error } = useAsyncResource(async () => {
    const [statistics, grades] = await Promise.all([getGradeStatistics().catch(() => null), getGrades()]);
    return {
      statistics,
      grades: normalizeList(grades),
    };
  }, []);

  const statsCards = useMemo(() => {
    if (!data) {
      return [];
    }

    const grades = data.grades;
    return [
      { label: "Notes", value: grades.length },
      { label: "Moyenne globale", value: `${mean(grades.map(getGradeValue)).toFixed(2)}/20` },
      { label: "Réussite", value: `${grades.length ? Math.round((grades.filter((grade) => getGradeValue(grade) >= 10).length / grades.length) * 100) : 0}%` },
      { label: "Stat API", value: data.statistics?.nombre_notes ?? grades.length },
    ];
  }, [data]);

  const bands = useMemo(() => {
    const grades = data?.grades || [];
    const total = grades.length || 1;
    return [
      { label: ">= 16", count: grades.filter((grade) => getGradeValue(grade) >= 16).length, color: "bg-green-600" },
      { label: "12 - 15.99", count: grades.filter((grade) => getGradeValue(grade) >= 12 && getGradeValue(grade) < 16).length, color: "bg-blue-600" },
      { label: "10 - 11.99", count: grades.filter((grade) => getGradeValue(grade) >= 10 && getGradeValue(grade) < 12).length, color: "bg-yellow-500" },
      { label: "< 10", count: grades.filter((grade) => getGradeValue(grade) < 10).length, color: "bg-red-600" },
    ].map((band) => ({ ...band, percent: Math.round((band.count / total) * 100) }));
  }, [data]);

  return (
    <SectionLayout title="Statistiques" description="Synthèse des performances académiques." loading={loading} error={error}>
      <StatsGrid items={statsCards} />
      <div className="bg-white border border-blue-700 p-6 rounded-none space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Répartition des notes</h2>
        {bands.map((band) => (
          <div key={band.label}>
            <div className="flex items-center justify-between text-sm text-slate-700 mb-1">
              <span>{band.label}</span>
              <span>
                {band.count} note(s) • {band.percent}%
              </span>
            </div>
            <div className="h-3 bg-slate-200">
              <div className={`${band.color} h-3`} style={{ width: `${band.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}

export function ReportsView() {
  const { data, loading, error } = useAsyncResource(async () => {
    const [users, students, courses, years, grades] = await Promise.all([
      getUsers(),
      getAllStudents(),
      getCourses(),
      getAcademicYears(),
      getGrades(),
    ]);

    return {
      users: normalizeList(users),
      students: normalizeList(students),
      courses: normalizeList(courses),
      years: normalizeList(years),
      grades: normalizeList(grades),
    };
  }, []);

  const summaryRows = data
    ? [
        { label: "Utilisateurs", value: data.users.length },
        { label: "Étudiants", value: data.students.length },
        { label: "UE", value: data.courses.length },
        { label: "Années académiques", value: data.years.length },
        { label: "Notes", value: data.grades.length },
        { label: "Moyenne générale", value: `${mean(data.grades.map(getGradeValue)).toFixed(2)}/20` },
      ]
    : [];

  return (
    <SectionLayout title="Rapports" description="Vue synthétique pour pilotage global." loading={loading} error={error}>
      <DataTable
        rows={summaryRows}
        columns={[
          { key: "label", label: "Indicateur" },
          { key: "value", label: "Valeur" },
        ]}
        emptyMessage="Aucun indicateur à afficher."
      />
    </SectionLayout>
  );
}

export function GradeEntry() {
  const { user } = useAuth();
  const { data, loading, error, setData } = useAsyncResource(async () => {
    // Pour les enseignants : charger leurs matières assignées au lieu de toutes les matières
    const isTeacher = user?.role === "teacher" || user?.role === "enseignant";
    
    const [subjects, students, sessions, grades] = await Promise.all([
      isTeacher ? getMyTeachingSubjects().catch(() => getAcademicSubjects()) : getAcademicSubjects(),
      getAllStudents(),
      getSessions(),
      getGrades(),
    ]);

    const teacherSubjects = normalizeList(subjects);

    const normalizedGrades = normalizeList(grades);

    return {
      subjects: teacherSubjects,
      students: normalizeList(students),
      sessions: normalizeList(sessions),
      isTeacher,
      allGrades: normalizedGrades,
      recentGrades: normalizedGrades
        .sort((a, b) => new Date(b.date_modification || b.date_creation || 0) - new Date(a.date_modification || a.date_creation || 0))
        .slice(0, 8),
    };
  }, [user?.id, user?.role]);

  const [formData, setFormData] = useState({
    etudiant: "",
    session: "",
    matiere: "",
    devoir: "",
    examen: "",
  });
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [submitState, setSubmitState] = useState({ loading: false, error: "", success: "" });

  // Auto-select session and matiere for teachers with only one subject
  useEffect(() => {
    if (data?.isTeacher && data?.subjects?.length > 0 && !formData.session && !formData.matiere) {
      // If teacher has only one subject, auto-select it
      if (data.subjects.length === 1) {
        const subject = data.subjects[0];
        setFormData((current) => ({
          ...current,
          matiere: String(subject.id),
          session: String(subject.session || ""),
        }));
      }
    }
  }, [data?.isTeacher, data?.subjects]);

  // Show all teacher's subjects (session is independent from matiere)
  const filteredSubjects = useMemo(() => {
    if (!data?.subjects) {
      return [];
    }
    // Return all subjects - session selection is independent from matiere choice
    return data.subjects;
  }, [data?.subjects]);

  const availableSessions = useMemo(() => {
    return normalizeList(data?.sessions || []);
  }, [data?.sessions]);

  const sessionsById = useMemo(() => {
    return new Map(availableSessions.map((session) => [String(session.id), session]));
  }, [availableSessions]);

  const selectedSubject = useMemo(() => {
    return filteredSubjects.find((subject) => String(subject.id) === String(formData.matiere)) || null;
  }, [filteredSubjects, formData.matiere]);

  const selectedSession = useMemo(() => {
    return availableSessions.find((session) => String(session.id) === String(formData.session)) || null;
  }, [availableSessions, formData.session]);

  const blockedStudentIds = useMemo(() => {
    if (!selectedSubject || !selectedSession || selectedSession.type_session !== "SR") {
      return new Set();
    }

    const sameSubjectOrdinaryPasses = normalizeList(data?.allGrades || []).filter((grade) => {
      const gradeValue = getGradeValue(grade);
      const gradeSession = sessionsById.get(String(grade.session));
      return String(grade.matiere) === String(selectedSubject.id)
        && gradeSession?.type_session === "SO"
        && gradeValue >= 10;
    });

    return new Set(sameSubjectOrdinaryPasses.map((grade) => String(grade.etudiant)));
  }, [data?.allGrades, selectedSubject, selectedSession, sessionsById]);

  useEffect(() => {
    if (editingGradeId) {
      return;
    }

    if (formData.etudiant && blockedStudentIds.has(String(formData.etudiant))) {
      setFormData((current) => ({
        ...current,
        etudiant: "",
      }));
    }
  }, [blockedStudentIds, editingGradeId, formData.etudiant]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };

      if (!editingGradeId && (name === "matiere" || name === "session")) {
        next.etudiant = "";
      }

      return next;
    });
  };

  const handleEdit = (grade) => {
    setFormData({
      etudiant: String(grade.etudiant),
      session: String(grade.session),
      matiere: String(grade.matiere),
      devoir: String(grade.note_devoir || grade.devoir || ""),
      examen: String(grade.note_examen || grade.examen || ""),
    });
    setEditingGradeId(grade.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingGradeId(null);
    setFormData({
      etudiant: "",
      session: "",
      matiere: "",
      devoir: "",
      examen: "",
    });
    setSubmitState({ loading: false, error: "", success: "" });
  };

  const handleDelete = async (gradeId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette note?")) {
      return;
    }

    setSubmitState({ loading: true, error: "", success: "" });
    try {
      await deleteGrade(gradeId);
      setData((current) => ({
        ...current,
        recentGrades: (current?.recentGrades || []).filter((g) => g.id !== gradeId),
      }));
      setSubmitState({ loading: false, error: "", success: "La note a été supprimée." });
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || "Impossible de supprimer la note.";
      setSubmitState({ loading: false, error: message, success: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitState({ loading: true, error: "", success: "" });

    try {
      let result;
      let successMessage;

      if (editingGradeId) {
        // Mode modification - envoyer SEULEMENT les champs modifiables
        const updatePayload = {
          devoir: Number(formData.devoir),
          examen: Number(formData.examen),
        };
        result = await updateGrade(editingGradeId, updatePayload);
        successMessage = "La note a été modifiée.";
        
        // Update existing grade in list
        setData((current) => ({
          ...current,
          recentGrades: (current?.recentGrades || []).map((g) =>
            g.id === editingGradeId ? result : g
          ),
        }));
        setEditingGradeId(null);
      } else {
        // Mode création - envoyer tous les champs
        const createPayload = {
          etudiant: Number(formData.etudiant),
          matiere: Number(formData.matiere),
          session: Number(formData.session),
          devoir: Number(formData.devoir),
          examen: Number(formData.examen),
        };
        result = await createGrade(createPayload);
        successMessage = "La note a été enregistrée.";
        
        // Add to list
        setData((current) => ({
          ...current,
          recentGrades: [result, ...(current?.recentGrades || [])].slice(0, 8),
        }));
      }

      setFormData({
        etudiant: "",
        session: "",
        matiere: "",
        devoir: "",
        examen: "",
      });
      setSubmitState({ loading: false, error: "", success: successMessage });
    } catch (err) {
      const details = err?.response?.data;
      const message =
        details?.detail ||
        details?.non_field_errors?.[0] ||
        details?.matiere?.[0] ||
        details?.note_devoir?.[0] ||
        details?.note_examen?.[0] ||
        details?.devoir?.[0] ||
        details?.examen?.[0] ||
        err?.message ||
        "Impossible d'enregistrer la note.";
      setSubmitState({ loading: false, error: message, success: "" });
    }
  };

  return (
    <SectionLayout title="Saisie des notes" description="Création réelle de notes depuis le backend." loading={loading} error={error}>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-blue-700 p-6 rounded-none">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {editingGradeId ? "Modifier la note" : "Nouvelle note"}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <select name="etudiant" value={formData.etudiant} onChange={handleChange} required disabled={!!editingGradeId} className="w-full px-4 py-3 border border-slate-300 rounded-none bg-white disabled:bg-slate-100 disabled:text-slate-500">
              <option value="">Choisir un étudiant</option>
              {normalizeList(data?.students || []).map((student) => {
                const isBlocked = blockedStudentIds.has(String(student.id));

                return (
                  <option key={student.id} value={student.id} disabled={isBlocked}>
                    {student.prenom} {student.nom} ({student.matricule || "sans matricule"})
                    {isBlocked ? " - déjà validé" : ""}
                  </option>
                );
              })}
            </select>

            {selectedSubject && selectedSession?.type_session === "SR" && blockedStudentIds.size > 0 ? (
              <div className="text-sm text-amber-700 bg-amber-50 p-3 border border-amber-300">
                Les étudiants ayant déjà validé cette matière en session ordinaire restent visibles mais sont désactivés pour la rattrapage.
              </div>
            ) : null}

            {selectedSubject && selectedSession?.type_session === "SR" && normalizeList(data?.students || []).length > 0 && blockedStudentIds.size === normalizeList(data?.students || []).length ? (
              <div className="text-sm text-red-700 bg-red-50 p-3 border border-red-300">
                Aucun étudiant éligible pour cette matière en session de rattrapage.
              </div>
            ) : null}

            <select name="session" value={formData.session} onChange={handleChange} required disabled={!!editingGradeId} className="w-full px-4 py-3 border border-slate-300 rounded-none bg-white disabled:bg-slate-100 disabled:text-slate-500">
              <option value="">Choisir une session</option>
              {availableSessions?.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.libelle}
                </option>
              ))}
            </select>

            <select
              name="matiere"
              value={formData.matiere}
              onChange={handleChange}
              required
              disabled={!!editingGradeId || filteredSubjects.length === 0}
              className="w-full px-4 py-3 border border-slate-300 rounded-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {!!editingGradeId
                      ? "Matière (non modifiable)"
                      : filteredSubjects.length === 0
                      ? "Aucune matière assignée à cet enseignant"
                      : "Choisir une matière"}
              </option>
              {filteredSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.nom || subject.ue_libelle || "Matière"}
                </option>
              ))}
            </select>

            {filteredSubjects.length === 0 ? (
              <div className="text-sm text-red-700">Aucune matière n'est assignée à cet enseignant.</div>
            ) : null}

            {editingGradeId && (
              <div className="text-sm text-blue-700 bg-blue-50 p-3 border border-blue-300">
                ℹ️ Mode édition: Vous pouvez modifier seulement les notes (devoir et examen).
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                min="0"
                max="20"
                step="0.25"
                name="devoir"
                value={formData.devoir}
                onChange={handleChange}
                required
                placeholder="Note devoir"
                className="w-full px-4 py-3 border border-slate-300 rounded-none"
              />
              <input
                type="number"
                min="0"
                max="20"
                step="0.25"
                name="examen"
                value={formData.examen}
                onChange={handleChange}
                required
                placeholder="Note examen"
                className="w-full px-4 py-3 border border-slate-300 rounded-none"
              />
            </div>

            {submitState.error ? <div className="text-sm text-red-700">{submitState.error}</div> : null}
            {submitState.success ? <div className="text-sm text-green-700">{submitState.success}</div> : null}

            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={submitState.loading || !formData.matiere} 
                className="flex-1 px-4 py-3 bg-blue-700 text-white border border-blue-700 rounded-none disabled:bg-slate-400 disabled:border-slate-400"
              >
                {submitState.loading 
                  ? "Traitement..." 
                  : editingGradeId 
                    ? "Modifier la note" 
                    : "Enregistrer la note"}
              </button>
              {editingGradeId && (
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-3 bg-slate-400 text-white border border-slate-400 rounded-none"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        <DataTable
          rows={data?.recentGrades || []}
          columns={[
            {
              key: "student",
              label: "Étudiant",
              render: (row) => `${row.etudiant_prenom || ""} ${row.etudiant_nom || ""}`.trim() || "—",
            },
            { key: "ue_libelle", label: "UE" },
            { key: "matiere_nom", label: "Matière" },
            { key: "moyenne", label: "Moyenne" },
            { key: "resultat", label: "Résultat" },
            { key: "date_modification", label: "Maj", render: (row) => formatDate(row.date_modification || row.date_creation) },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="px-2 py-1 text-sm bg-blue-600 text-white border border-blue-600 rounded-none hover:bg-blue-700"
                    title="Modifier cette note"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="px-2 py-1 text-sm bg-red-600 text-white border border-red-600 rounded-none hover:bg-red-700"
                    title="Supprimer cette note"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="Aucune note récente pour vos UE."
        />
      </div>
    </SectionLayout>
  );
}

export function ResultatsView() {
  const { user } = useAuth();
  const normalizedRole = normalizeRole(user?.role);
  const LEFT_LOGO_STORAGE_KEY = "print_logo_left";
  const RIGHT_LOGO_STORAGE_KEY = "print_logo_right";
  
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [leftLogo, setLeftLogo] = useState("");
  const [rightLogo, setRightLogo] = useState("");

  const printGeneratedAt = useMemo(() => new Date().toLocaleString("fr-FR"), []);

  const handlePrint = () => {
    const previousTitle = document.title;
    const dateTag = new Date().toISOString().slice(0, 10);
    document.title = `Resultats_${dateTag}`;

    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    window.print();
  };

  useEffect(() => {
    setLeftLogo(localStorage.getItem(LEFT_LOGO_STORAGE_KEY) || "");
    setRightLogo(localStorage.getItem(RIGHT_LOGO_STORAGE_KEY) || "");
  }, []);

  const handleLogoUpload = (side, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value) return;

      if (side === "left") {
        localStorage.setItem(LEFT_LOGO_STORAGE_KEY, value);
        setLeftLogo(value);
      } else {
        localStorage.setItem(RIGHT_LOGO_STORAGE_KEY, value);
        setRightLogo(value);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearLogos = () => {
    localStorage.removeItem(LEFT_LOGO_STORAGE_KEY);
    localStorage.removeItem(RIGHT_LOGO_STORAGE_KEY);
    setLeftLogo("");
    setRightLogo("");
  };
  
  const { data, loading, error } = useAsyncResource(async () => {
    if (normalizedRole === "student") {
      const profile = await getMyProfile().catch(() => null);
      const studentProfileId = profile?.id;

      if (!studentProfileId) {
        return {
          ueResults: [],
          semesterResults: [],
          students: [],
          semesters: [],
          studentProfileId: null,
        };
      }

      const [ueResults, semesterResults] = await Promise.all([
        getStudentUEResults(studentProfileId).catch(() => []),
        getStudentSemesterResults(studentProfileId).catch(() => []),
      ]);
      return {
        ueResults: normalizeList(ueResults),
        semesterResults: normalizeList(semesterResults),
        students: [],
        semesters: await getSemesters().catch(() => []),
        studentProfileId,
      };
    }

    if (normalizedRole === "teacher") {
      const [students, ueResults, semesterResults, semesters] = await Promise.all([
        getAllStudents().catch(() => []),
        getUEResults().catch(() => []),
        getSemesterResults().catch(() => []),
        getSemesters().catch(() => []),
      ]);
      return {
        students: normalizeList(students),
        ueResults: normalizeList(ueResults),
        semesterResults: normalizeList(semesterResults),
        semesters: normalizeList(semesters),
      };
    }

    if (normalizedRole === "admin") {
      const [students, ueResults, semesterResults, semesters, courses] = await Promise.all([
        getAllStudents().catch(() => []),
        getUEResults().catch(() => []),
        getSemesterResults().catch(() => []),
        getSemesters().catch(() => []),
        getCourses().catch(() => []),
      ]);
      return {
        students: normalizeList(students),
        ueResults: normalizeList(ueResults),
        semesterResults: normalizeList(semesterResults),
        semesters: normalizeList(semesters),
        courses: normalizeList(courses),
      };
    }

    // Supervisor
    const [students, ueResults, semesterResults, semesters] = await Promise.all([
      getAllStudents().catch(() => []),
      getUEResults().catch(() => []),
      getSemesterResults().catch(() => []),
      getSemesters().catch(() => []),
    ]);
    return {
      students: normalizeList(students),
      ueResults: normalizeList(ueResults),
      semesterResults: normalizeList(semesterResults),
      semesters: normalizeList(semesters),
    };
  }, [user?.id, normalizedRole]);

  // Extract unique matieres from ueResults
  const uniqueMatieres = useMemo(() => {
    if (!data?.ueResults) return [];
    
    const matieresMap = new Map();
    data.ueResults.forEach((result) => {
      if (result.matieres && Array.isArray(result.matieres)) {
        result.matieres.forEach((matiere) => {
          if (!matieresMap.has(matiere.id)) {
            matieresMap.set(matiere.id, matiere);
          }
        });
      }
    });
    
    return Array.from(matieresMap.values()).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [data?.ueResults]);

  // Filter UE results based on selection
  const filteredUEResults = useMemo(() => {
    if (!data?.ueResults) return [];
    
    let filtered = data.ueResults;
    
    if (normalizedRole === "student") {
      filtered = filtered.filter((r) => String(r.etudiant) === String(data?.studentProfileId));
    } else if (selectedStudent) {
      filtered = filtered.filter((r) => String(r.etudiant) === String(selectedStudent));
    }
    
    if (selectedMatiere) {
      filtered = filtered.filter((r) => {
        if (r.matieres && Array.isArray(r.matieres)) {
          return r.matieres.some((m) => String(m.id) === String(selectedMatiere));
        }
        return false;
      });
    }
    
    return filtered;
  }, [data?.ueResults, data?.studentProfileId, selectedStudent, selectedMatiere, normalizedRole]);

  // Filter semester results based on selection
  const filteredSemesterResults = useMemo(() => {
    if (!data?.semesterResults) return [];
    
    let filtered = data.semesterResults;
    
    if (normalizedRole === "student") {
      filtered = filtered.filter((r) => String(r.etudiant) === String(data?.studentProfileId));
    } else if (selectedStudent) {
      filtered = filtered.filter((r) => String(r.etudiant) === String(selectedStudent));
    }
    
    if (selectedSemester) {
      filtered = filtered.filter((r) => String(r.semestre) === String(selectedSemester));
    }
    
    return filtered;
  }, [data?.semesterResults, data?.studentProfileId, selectedStudent, selectedSemester, normalizedRole]);

  const selectedStudentLabel = useMemo(() => {
    if (!selectedStudent || !data?.students?.length) return "Tous";
    const student = data.students.find((item) => String(item.id) === String(selectedStudent));
    return student ? `${student.prenom || ""} ${student.nom || ""}`.trim() || student.matricule || `Étudiant #${selectedStudent}` : `Étudiant #${selectedStudent}`;
  }, [data?.students, selectedStudent]);

  const selectedMatiereLabel = useMemo(() => {
    if (!selectedMatiere || !uniqueMatieres.length) return "Toutes";
    const matiere = uniqueMatieres.find((item) => String(item.id) === String(selectedMatiere));
    return matiere ? matiere.nom : `Matière #${selectedMatiere}`;
  }, [selectedMatiere, uniqueMatieres]);

  const selectedSemesterLabel = useMemo(() => {
    if (!selectedSemester || !data?.semesters?.length) return "Tous";
    const semester = data.semesters.find((item) => String(item.id) === String(selectedSemester));
    return semester ? `Semestre ${semester.numero}` : `Semestre #${selectedSemester}`;
  }, [data?.semesters, selectedSemester]);

  const printSummary = useMemo(() => {
    const ueAverage = mean(
      filteredUEResults
        .map((row) => Number.parseFloat(row.moyenne))
        .filter((value) => Number.isFinite(value))
    );

    const semesterAverage = mean(
      filteredSemesterResults
        .map((row) => Number.parseFloat(row.moyenne_generale))
        .filter((value) => Number.isFinite(value))
    );

    return {
      ueCount: filteredUEResults.length,
      semesterCount: filteredSemesterResults.length,
      ueAverage,
      semesterAverage,
    };
  }, [filteredUEResults, filteredSemesterResults]);

  const printStudentIdentity = useMemo(() => {
    const fallback = { nom: "—", prenom: "—", matricule: "—" };

    if (normalizedRole === "student") {
      const fromRows = filteredUEResults.find((row) => row.etudiant_nom || row.etudiant_prenom);
      if (!fromRows) return fallback;

      return {
        nom: fromRows.etudiant_nom || "—",
        prenom: fromRows.etudiant_prenom || "—",
        matricule: user?.username || "—",
      };
    }

    if (!selectedStudent || !data?.students?.length) {
      return fallback;
    }

    const found = data.students.find((row) => String(row.id) === String(selectedStudent));
    if (!found) return fallback;

    return {
      nom: found.nom || "—",
      prenom: found.prenom || "—",
      matricule: found.matricule || "—",
    };
  }, [normalizedRole, filteredUEResults, user?.username, selectedStudent, data?.students]);

  const matriculeChars = useMemo(() => {
    return String(printStudentIdentity.matricule || "")
      .split("")
      .filter((char) => char.trim() !== "")
      .slice(0, 14);
  }, [printStudentIdentity.matricule]);

  const academicYearLabel = useMemo(() => {
    const fromSemester = (data?.semesters || []).find((semester) => semester?.annee_academique_libelle)?.annee_academique_libelle;
    return fromSemester || "Année universitaire en cours";
  }, [data?.semesters]);

  return (
    <SectionLayout
      title="Résultats"
      description="Résultats détaillés par Matière et semestre."
      loading={loading}
      error={error}
      actions={
        <button type="button" onClick={handlePrint} className="px-4 py-2 bg-blue-700 text-white border border-blue-700 rounded-none no-print">
          Imprimer / PDF
        </button>
      }
    >
      <div className="no-print mb-4 border border-slate-300 p-3 bg-slate-50 print-logo-toolbar">
        <div className="text-sm font-semibold text-slate-800 mb-2">Logos pour impression (import local)</div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-700">
            Logo université
            <input
              type="file"
              accept="image/*"
              className="ml-2"
              onChange={(event) => handleLogoUpload("left", event.target.files?.[0])}
            />
          </label>
          <label className="text-sm text-slate-700">
            Logo faculté
            <input
              type="file"
              accept="image/*"
              className="ml-2"
              onChange={(event) => handleLogoUpload("right", event.target.files?.[0])}
            />
          </label>
          <button type="button" onClick={clearLogos} className="px-3 py-1 border border-slate-400 text-slate-700 bg-white">
            Réinitialiser les logos
          </button>
        </div>
      </div>

      <div className="print-only mb-6 hidden print:block">
        <div className="print-header-sheet">
          {/* En-tête institutionnel en 3 colonnes */}
          <div className="report-header">
            {/* Colonne gauche */}
            <div className="report-left">
              <div className="report-line report-strong">Université Officielle</div>
              <div className="report-line">Direction de la scolarité</div>
              <div className="report-line">Service des relevés</div>
              {leftLogo ? <img src={leftLogo} alt="Logo université" className="report-logo" /> : <div className="report-logo-placeholder">Logo université</div>}
            </div>

            {/* Colonne centrale */}
            <div className="report-center">
              <div className="report-year">{academicYearLabel}</div>
              <div className="report-title-box">RELEVÉ INDIVIDUEL DE NOTES ET RÉSULTATS</div>
              <div className="report-program">Licence d&apos;Informatique</div>
            </div>

            {/* Colonne droite */}
            <div className="report-right">
              <div className="report-line report-strong">Faculté</div>
              <div className="report-line">Vice-décanat</div>
              <div className="report-line">Service de la scolarité</div>
              {rightLogo ? <img src={rightLogo} alt="Logo faculté" className="report-logo" /> : <div className="report-logo-placeholder">Logo faculté</div>}
            </div>
          </div>

          {/* Informations étudiant */}
          <div className="student-info">
            <div className="student-row"><span className="student-label">Nom</span><span className="student-value">{printStudentIdentity.nom}</span></div>
            <div className="student-row"><span className="student-label">Prénom</span><span className="student-value">{printStudentIdentity.prenom}</span></div>
            <div className="student-row matricule-row">
              <span className="student-label">Matricule</span>
              <span className="student-value matricule-boxes">
                {matriculeChars.length ? (
                  matriculeChars.map((char, index) => (
                    <span key={`${char}-${index}`} className="matricule-box">{char}</span>
                  ))
                ) : (
                  <span className="student-value">—</span>
                )}
              </span>
            </div>
          </div>

          <div className="report-meta-grid">
            <div><strong>Utilisateur:</strong> {user?.username || "—"}</div>
            <div><strong>Rôle:</strong> {normalizedRole || "—"}</div>
            <div><strong>Généré le:</strong> {printGeneratedAt}</div>
            <div><strong>Étudiant ciblé:</strong> {selectedStudentLabel}</div>
            <div><strong>Matière:</strong> {selectedMatiereLabel}</div>
            <div><strong>Semestre:</strong> {selectedSemesterLabel}</div>
            <div><strong>Lignes Matière:</strong> {printSummary.ueCount}</div>
            <div><strong>Moyenne Matière:</strong> {printSummary.ueCount ? `${printSummary.ueAverage.toFixed(2)}/20` : "—"}</div>
            <div><strong>Lignes Semestre:</strong> {printSummary.semesterCount}</div>
            <div><strong>Moyenne Semestre:</strong> {printSummary.semesterCount ? `${printSummary.semesterAverage.toFixed(2)}/20` : "—"}</div>
          </div>
        </div>
      </div>

      <div className="space-y-8 results-print-page">
        {/* Résultats d'UE par Matière */}
        <div className="bg-white border border-blue-700 p-6 rounded-none results-print-section">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Résultats par Matière</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 no-print">
            {normalizedRole !== "student" && (
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-none bg-white"
              >
                <option value="">Sélectionner un étudiant</option>
                {data?.students?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.prenom} {student.nom} ({student.matricule || "sans matricule"})
                  </option>
                ))}
              </select>
            )}
            
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-none bg-white"
            >
              <option value="">Sélectionner une matière</option>
              {uniqueMatieres.map((matiere) => (
                <option key={matiere.id} value={matiere.id}>
                  {matiere.nom}
                </option>
              ))}
            </select>
          </div>

          {filteredUEResults.length > 0 ? (
            <div className="results-table">
              <DataTable
                rows={filteredUEResults}
                columns={[
                  {
                    key: "etudiant_nom",
                    label: "Étudiant",
                    render: (row) => `${row.etudiant_prenom || ""} ${row.etudiant_nom || ""}`.trim() || "—",
                  },
                  { key: "primary_matiere_nom", label: "Matière" },
                  { key: "ue_libelle", label: "UE" },
                  { key: "session_libelle", label: "Session" },
                  { key: "moyenne", label: "Moyenne", render: (row) => row.moyenne ? `${row.moyenne}/20` : "—" },
                  { key: "resultat", label: "Statut", render: (row) => getStatusLabel(row.resultat) },
                ]}
                emptyMessage="Aucun résultat de matière trouvé."
              />
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              {normalizedRole === "student"
                ? data?.studentProfileId
                  ? "Aucun résultat d'UE pour le moment."
                  : "Profil étudiant introuvable."
                : "Sélectionnez un étudiant pour voir ses résultats."}
            </div>
          )}
        </div>

        {/* Résultats de Semestre */}
        <div className="bg-white border border-blue-700 p-6 rounded-none results-print-section">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Résultats par Semestre</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 no-print">
            {normalizedRole !== "student" && (
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-none bg-white"
              >
                <option value="">Sélectionner un étudiant</option>
                {data?.students?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.prenom} {student.nom} ({student.matricule || "sans matricule"})
                  </option>
                ))}
              </select>
            )}
            
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-none bg-white"
            >
              <option value="">Sélectionner un semestre</option>
              {data?.semesters?.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  Semestre {semester.numero} - {semester.annee_academique_libelle}
                </option>
              ))}
            </select>
          </div>

          {filteredSemesterResults.length > 0 ? (
            <div className="results-table">
              <DataTable
                rows={filteredSemesterResults}
                columns={[
                  {
                    key: "etudiant_nom",
                    label: "Étudiant",
                    render: (row) => `${row.etudiant_prenom || ""} ${row.etudiant_nom || ""}`.trim() || "—",
                  },
                  { key: "semestre_numero", label: "Semestre" },
                  { key: "session_libelle", label: "Session" },
                  { key: "moyenne_generale", label: "Moyenne", render: (row) => row.moyenne_generale ? `${row.moyenne_generale}/20` : "—" },
                  { key: "resultat", label: "Statut", render: (row) => getStatusLabel(row.resultat) },
                ]}
                emptyMessage="Aucun résultat de semestre trouvé."
              />
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              {normalizedRole === "student"
                ? data?.studentProfileId
                  ? "Aucun résultat de semestre pour le moment."
                  : "Profil étudiant introuvable."
                : "Sélectionnez un étudiant pour voir ses résultats."}
            </div>
          )}
        </div>
      </div>
    </SectionLayout>
  );
}

export function MyClasses() {
  return (
    <GenericResourcePage
      title="Mes classes"
      description="Vue réelle sur les UE que vous enseignez."
      loader={getMyTeachingCourses}
      statsBuilder={(rows) => [
        { label: "UE gérées", value: rows.length },
      ]}
      columns={[
        { key: "code_ue", label: "Code" },
        { key: "libelle", label: "UE" },
        { key: "classe_nom", label: "Classe" },
        { key: "semestre_numero", label: "Semestre" },
      ]}
      emptyMessage="Aucune UE liée à votre compte."
    />
  );
}

export function MyStudents() {
  const { data, loading, error } = useAsyncResource(async () => {
    const [courses, students, grades] = await Promise.all([getMyTeachingCourses(), getAllStudents(), getGrades()]);
    const teacherCourses = normalizeList(courses);
    const courseIds = new Set(teacherCourses.map((course) => course.id));
    const studentIds = new Set(
      normalizeList(grades)
        .filter((grade) => courseIds.has(grade.ue))
        .map((grade) => grade.etudiant)
    );

    return normalizeList(students).filter((student) => studentIds.has(student.id));
  }, []);

  return (
    <SectionLayout title="Mes étudiants" description="Étudiants détectés à partir de vos notes et de vos UE." loading={loading} error={error}>
      <StatsGrid items={[{ label: "Étudiants suivis", value: data?.length || 0 }]} />
      <DataTable
        rows={data || []}
        columns={[
          { key: "matricule", label: "Matricule" },
          {
            key: "nom_complet",
            label: "Nom",
            render: (row) => `${row.prenom || ""} ${row.nom || ""}`.trim() || "—",
          },
          { key: "email", label: "Email" },
          { key: "telephone", label: "Téléphone" },
        ]}
        emptyMessage="Aucun étudiant lié à vos notes pour le moment."
      />
    </SectionLayout>
  );
}

export function EvaluationsManagement() {
  return (
    <GenericResourcePage
      title="Évaluations / sessions"
      description="Sessions d'évaluation configurées dans la plateforme."
      loader={getSessions}
      statsBuilder={(rows) => [{ label: "Sessions", value: rows.length }]}
      columns={[
        { key: "libelle", label: "Libellé" },
        { key: "description", label: "Description" },
      ]}
      emptyMessage="Aucune session d'évaluation disponible."
    />
  );
}

export function TeacherStats() {
  const { data, loading, error } = useAsyncResource(async () => {
    const [courses, grades] = await Promise.all([getMyTeachingCourses(), getGrades()]);
    const courseIds = new Set(normalizeList(courses).map((course) => course.id));
    const myGrades = normalizeList(grades).filter((grade) => courseIds.has(grade.ue));
    return myGrades;
  }, []);

  const grades = data || [];

  return (
    <SectionLayout title="Mes statistiques" description="Indicateurs calculés depuis vos vraies notes." loading={loading} error={error}>
      <StatsGrid
        items={[
          { label: "Notes saisies", value: grades.length },
          { label: "Moyenne", value: `${mean(grades.map(getGradeValue)).toFixed(2)}/20` },
          { label: "Réussite", value: `${grades.length ? Math.round((grades.filter((grade) => getGradeValue(grade) >= 10).length / grades.length) * 100) : 0}%` },
        ]}
      />
      <DataTable
        rows={grades.slice(0, 10)}
        columns={[
          {
            key: "student",
            label: "Étudiant",
            render: (row) => `${row.etudiant_prenom || ""} ${row.etudiant_nom || ""}`.trim() || "—",
          },
          { key: "ue_libelle", label: "UE" },
          { key: "moyenne", label: "Moyenne" },
          { key: "resultat", label: "Résultat" },
        ]}
        emptyMessage="Aucune statistique disponible."
      />
    </SectionLayout>
  );
}

export function StudentGrades() {
  const { data, loading, error } = useAsyncResource(async () => normalizeList(await getMyGrades()), []);
  const [semesterFilter, setSemesterFilter] = useState("all");

  const grades = data || [];
  const semesters = uniqBy(grades, (grade) => grade.semestre_numero).map((grade) => grade.semestre_numero).filter(Boolean);
  const filteredGrades =
    semesterFilter === "all" ? grades : grades.filter((grade) => String(grade.semestre_numero) === semesterFilter);

  return (
    <SectionLayout
      title="Mes notes"
      description="Relevé alimenté directement depuis l'API de l'étudiant."
      loading={loading}
      error={error}
      actions={
        <select
          value={semesterFilter}
          onChange={(event) => setSemesterFilter(event.target.value)}
          className="px-4 py-2 border border-slate-300 bg-white rounded-none"
        >
          <option value="all">Tous les semestres</option>
          {semesters.map((semester) => (
            <option key={semester} value={String(semester)}>
              Semestre {semester}
            </option>
          ))}
        </select>
      }
    >
      <StatsGrid
        items={[
          { label: "Notes", value: grades.length },
          { label: "Moyenne globale", value: `${mean(grades.map(getGradeValue)).toFixed(2)}/20` },
          { label: "Validées", value: grades.filter((grade) => getGradeValue(grade) >= 10).length },
          { label: "Échec", value: grades.filter((grade) => getGradeValue(grade) < 10).length },
        ]}
      />
      <DataTable
        rows={filteredGrades}
        columns={[
          { key: "ue_libelle", label: "UE" },
          { key: "session_libelle", label: "Session" },
          { key: "semestre_numero", label: "Semestre" },
          { key: "devoir", label: "Devoir" },
          { key: "examen", label: "Examen" },
          { key: "moyenne", label: "Moyenne" },
          { key: "resultat", label: "Résultat" },
          { key: "date_modification", label: "Maj", render: (row) => formatDate(row.date_modification || row.date_creation) },
        ]}
        emptyMessage="Aucune note trouvée pour ce filtre."
      />
    </SectionLayout>
  );
}

export function StudentAverage() {
  const { data, loading, error } = useAsyncResource(async () => normalizeList(await getMyGrades()), []);
  const grades = data || [];
  const semesters = uniqBy(grades, (grade) => grade.semestre_numero)
    .map((grade) => grade.semestre_numero)
    .filter(Boolean)
    .map((semester) => ({
      semester,
      average: mean(grades.filter((grade) => grade.semestre_numero === semester).map(getGradeValue)),
    }));

  return (
    <SectionLayout title="Mes moyennes" description="Agrégation par semestre à partir des notes réelles." loading={loading} error={error}>
      <StatsGrid
        items={[
          { label: "Moyenne générale", value: `${mean(grades.map(getGradeValue)).toFixed(2)}/20` },
          { label: "Meilleure note", value: grades.length ? `${Math.max(...grades.map(getGradeValue)).toFixed(2)}/20` : "0/20" },
          { label: "Plus faible note", value: grades.length ? `${Math.min(...grades.map(getGradeValue)).toFixed(2)}/20` : "0/20" },
        ]}
      />
      <DataTable
        rows={semesters.map((item) => ({ id: item.semester, ...item }))}
        columns={[
          { key: "semester", label: "Semestre", render: (row) => `Semestre ${row.semester}` },
          { key: "average", label: "Moyenne", render: (row) => `${row.average.toFixed(2)}/20` },
        ]}
        emptyMessage="Aucune moyenne à calculer."
      />
    </SectionLayout>
  );
}

export function GradesHistory() {
  const { data, loading, error } = useAsyncResource(async () => normalizeList(await getMyGrades()), []);
  const rows = [...(data || [])].sort(
    (a, b) => new Date(b.date_modification || b.date_creation || 0) - new Date(a.date_modification || a.date_creation || 0)
  );

  return (
    <SectionLayout title="Historique des notes" description="Historique trié des modifications et saisies." loading={loading} error={error}>
      <DataTable
        rows={rows}
        columns={[
          { key: "date_modification", label: "Date", render: (row) => formatDate(row.date_modification || row.date_creation) },
          { key: "ue_libelle", label: "UE" },
          { key: "session_libelle", label: "Session" },
          { key: "moyenne", label: "Moyenne" },
          { key: "resultat", label: "Résultat" },
        ]}
        emptyMessage="Aucun historique disponible."
      />
    </SectionLayout>
  );
}

export function StudentProfile() {
  const { user } = useAuth();
  const normalizedRole = normalizeRole(user?.role);
  const [formData, setFormData] = useState({});
  const [submitState, setSubmitState] = useState({ loading: false, success: "", error: "" });

  const roleConfig = useMemo(() => {
    if (normalizedRole === "teacher") {
      return {
        description: "Complétez et mettez à jour votre fiche enseignant.",
        fields: ["nom", "prenom", "email", "telephone", "adresse", "specialite", "grade"],
        labels: {
          nom: "Nom",
          prenom: "Prénom",
          email: "Email",
          telephone: "Téléphone",
          adresse: "Adresse",
          specialite: "Spécialité",
          grade: "Grade",
        },
      };
    }

    if (normalizedRole === "supervisor") {
      return {
        description: "Complétez et mettez à jour votre fiche superviseur.",
        fields: ["nom", "prenom", "email", "telephone", "adresse", "departement", "fonction"],
        labels: {
          nom: "Nom",
          prenom: "Prénom",
          email: "Email",
          telephone: "Téléphone",
          adresse: "Adresse",
          departement: "Département",
          fonction: "Fonction",
        },
      };
    }

    if (normalizedRole === "admin") {
      return {
        description: "Mettez à jour les informations de votre compte administrateur.",
        fields: ["username", "email", "first_name", "last_name"],
        labels: {
          username: "Nom d'utilisateur",
          email: "Email",
          first_name: "Prénom",
          last_name: "Nom",
        },
      };
    }

    return {
      description: "Complétez et mettez à jour votre fiche étudiant.",
      fields: ["nom", "prenom", "matricule", "email", "telephone", "adresse", "date_naissance", "lieu_naissance", "sexe"],
      labels: {
        nom: "Nom",
        prenom: "Prénom",
        matricule: "Matricule",
        email: "Email",
        telephone: "Téléphone",
        adresse: "Adresse",
        date_naissance: "Date de naissance",
        lieu_naissance: "Lieu de naissance",
        sexe: "Sexe",
      },
    };
  }, [normalizedRole]);

  const { data, loading, error, setData } = useAsyncResource(async () => {
    if (normalizedRole === "teacher") {
      try {
        const profile = await getMyTeacherProfile();
        return { exists: true, profile };
      } catch (err) {
        if (err?.response?.status === 404) return { exists: false, profile: null };
        throw err;
      }
    }

    if (normalizedRole === "supervisor") {
      try {
        const profile = await getMySupervisorProfile();
        return { exists: true, profile };
      } catch (err) {
        if (err?.response?.status === 404) return { exists: false, profile: null };
        throw err;
      }
    }

    if (normalizedRole === "admin") {
      const users = normalizeList(await getUsers());
      const profile = users.find((item) => item.id === user?.id) || null;
      return { exists: !!profile, profile };
    }

    try {
      const profile = await getMyProfile();
      return { exists: true, profile };
    } catch (err) {
      if (err?.response?.status === 404) return { exists: false, profile: null };
      throw err;
    }
  }, [user?.id, normalizedRole]);

  useEffect(() => {
    if (!data?.profile) {
      setFormData({});
      return;
    }

    const next = {};
    roleConfig.fields.forEach((field) => {
      next[field] = data.profile?.[field] ?? "";
    });
    setFormData(next);
  }, [data?.profile, roleConfig.fields]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitState({ loading: true, success: "", error: "" });

    const payload = roleConfig.fields.reduce((acc, field) => {
      acc[field] = formData[field] ?? "";
      return acc;
    }, {});

    try {
      let updated = null;
      if (normalizedRole === "teacher") {
        updated = await updateMyTeacherProfile(payload);
      } else if (normalizedRole === "supervisor") {
        updated = await updateMySupervisorProfile(payload);
      } else if (normalizedRole === "admin") {
        updated = await updateUser(user.id, payload);
      } else {
        updated = await updateMyProfile(payload);
      }

      setData({ exists: true, profile: updated });
      setSubmitState({ loading: false, success: "Profil mis à jour avec succès.", error: "" });
    } catch (err) {
      const apiError = err?.response?.data;
      const detail =
        apiError?.detail ||
        apiError?.erreur ||
        (typeof apiError === "object" && Object.values(apiError)?.flat()?.[0]) ||
        err?.message ||
        "Mise à jour impossible.";

      setSubmitState({ loading: false, success: "", error: String(detail) });
    }
  };

  return (
    <SectionLayout title="Mon profil" description={roleConfig.description} loading={loading} error={error}>
      {!data?.exists ? (
        <EmptyState message="Aucun profil lié à votre compte pour ce rôle. Contactez l'administrateur." />
      ) : (
        <div className="bg-white border border-blue-700 p-6 rounded-none">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleConfig.fields.map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">{roleConfig.labels[field] || field}</label>
                  {field === "sexe" ? (
                    <select
                      value={formData[field] || ""}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-none bg-white"
                    >
                      <option value="">Sélectionner</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  ) : (
                    <input
                      type={field === "date_naissance" ? "date" : "text"}
                      value={formData[field] || ""}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {submitState.error ? <div className="text-sm text-red-700">{submitState.error}</div> : null}
            {submitState.success ? <div className="text-sm text-green-700">{submitState.success}</div> : null}

            <button
              type="submit"
              disabled={submitState.loading}
              className="px-5 py-3 bg-blue-700 text-white border border-blue-700 rounded-none disabled:bg-slate-400 disabled:border-slate-400"
            >
              {submitState.loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </form>
        </div>
      )}
    </SectionLayout>
  );
}

export function ValidateGrades() {
  const { data, loading, error, setData } = useAsyncResource(async () => normalizeList(await getGrades()), []);
  const [actionState, setActionState] = useState({ loading: false, message: "", error: "" });

  const handleRecalculate = async () => {
    setActionState({ loading: true, message: "", error: "" });

    try {
      const response = await recalculateAverages();
      const freshGrades = normalizeList(await getGrades());
      setData(freshGrades);
      setActionState({
        loading: false,
        message: response?.message || "Les moyennes ont été recalculées.",
        error: "",
      });
    } catch (err) {
      setActionState({
        loading: false,
        message: "",
        error: err?.response?.data?.detail || err?.message || "Le recalcul a échoué.",
      });
    }
  };

  const flaggedGrades = (data || []).filter((grade) => getGradeValue(grade) < 10);

  return (
    <SectionLayout
      title="Surveillance des notes"
      description="Vue superviseur avec recalcul des moyennes et focus sur les notes fragiles."
      loading={loading}
      error={error}
      actions={
        <button type="button" onClick={handleRecalculate} disabled={actionState.loading} className="px-4 py-2 bg-blue-700 text-white border border-blue-700 rounded-none">
          {actionState.loading ? "Recalcul..." : "Recalculer les moyennes"}
        </button>
      }
    >
      {actionState.message ? <div className="text-sm text-green-700">{actionState.message}</div> : null}
      {actionState.error ? <div className="text-sm text-red-700">{actionState.error}</div> : null}
      <StatsGrid
        items={[
          { label: "Notes totales", value: data?.length || 0 },
          { label: "À surveiller", value: flaggedGrades.length },
          { label: "Moyenne globale", value: `${mean((data || []).map(getGradeValue)).toFixed(2)}/20` },
        ]}
      />
      <DataTable
        rows={flaggedGrades}
        columns={[
          {
            key: "student",
            label: "Étudiant",
            render: (row) => `${row.etudiant_prenom || ""} ${row.etudiant_nom || ""}`.trim() || "—",
          },
          { key: "ue_libelle", label: "UE" },
          { key: "moyenne", label: "Moyenne" },
          { key: "resultat", label: "Résultat" },
          { key: "date_modification", label: "Maj", render: (row) => formatDate(row.date_modification || row.date_creation) },
        ]}
        emptyMessage="Aucune note critique à signaler."
      />
    </SectionLayout>
  );
}

export function SuperviseTeachers() {
  const { data, loading, error } = useAsyncResource(async () => {
    const [users, courses] = await Promise.all([getUsers(), getCourses()]);
    const teachers = normalizeList(users).filter((user) => user.role === "teacher");
    const teachingLoad = normalizeList(courses).reduce((map, course) => {
      const key = course.enseignant;
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map());

    return teachers.map((teacher) => ({
      ...teacher,
      ue_count: teachingLoad.get(teacher.id) || 0,
    }));
  }, []);

  return (
    <SectionLayout title="Superviser les enseignants" description="Liste des enseignants et de leur charge UE." loading={loading} error={error}>
      <DataTable
        rows={data || []}
        columns={[
          { key: "username", label: "Compte" },
          { key: "email", label: "Email" },
          { key: "ue_count", label: "UE gérées" },
          { key: "is_active", label: "Statut", render: (row) => (row.is_active ? "Actif" : "Inactif") },
        ]}
        emptyMessage="Aucun enseignant à superviser."
      />
    </SectionLayout>
  );
}

export function AllStudents() {
  return <StudentsManagement />;
}

export function AllTeachers() {
  const { data, loading, error } = useAsyncResource(async () => normalizeList(await getUsers()), []);
  const teachers = (data || []).filter((user) => user.role === "teacher");

  return (
    <SectionLayout title="Tous les enseignants" description="Extraction des comptes enseignants." loading={loading} error={error}>
      <DataTable
        rows={teachers}
        columns={[
          { key: "username", label: "Compte" },
          { key: "email", label: "Email" },
          { key: "first_name", label: "Prénom" },
          { key: "last_name", label: "Nom" },
          { key: "is_active", label: "Statut", render: (row) => (row.is_active ? "Actif" : "Inactif") },
        ]}
        emptyMessage="Aucun enseignant disponible."
      />
    </SectionLayout>
  );
}

export function DetailedReports() {
  return <ReportsView />;
}

export function PerformanceMonitoring() {
  return <StatisticsView />;
}
