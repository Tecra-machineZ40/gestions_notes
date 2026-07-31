import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "./common/Layout";
import DashboardContent from "./dashboard/DashboardContent";
import { normalizeRole } from "../utils/roles";
import "./dashboard/Dashboard.css";

const navigationByRole = {
  admin: [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "resultats", label: "Résultats", icon: "🏆" },
    { id: "users", label: "Utilisateurs", icon: "👥" },
    { id: "students", label: "Étudiants", icon: "🎓" },
    { id: "courses", label: "Cours", icon: "📚" },
    { id: "semesters", label: "Semestres", icon: "🗓️" },
    { id: "years", label: "Années", icon: "📆" },
    { id: "grades", label: "Notes", icon: "📝" },
    { id: "statistics", label: "Statistiques", icon: "📈" },
    { id: "reports", label: "Rapports", icon: "📋" },
    { id: "audit-logs", label: "Audit admin", icon: "🧾" },
    { id: "profile", label: "Profil", icon: "👤" },
  ],
  teacher: [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "resultats", label: "Résultats", icon: "🏆" },
    { id: "grade-entry", label: "Saisir notes", icon: "✏️" },
    { id: "my-classes", label: "Mes classes", icon: "🏫" },
    { id: "my-students", label: "Mes étudiants", icon: "🎓" },
    { id: "evaluations", label: "Évaluations", icon: "📋" },
    { id: "my-stats", label: "Mes statistiques", icon: "📈" },
    { id: "profile", label: "Profil", icon: "👤" },
  ],
  student: [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "resultats", label: "Résultats", icon: "🏆" },
    { id: "my-grades", label: "Mes notes", icon: "📚" },
    { id: "my-average", label: "Mes moyennes", icon: "📈" },
    { id: "history", label: "Historique", icon: "🕒" },
    { id: "profile", label: "Profil", icon: "👤" },
  ],
  supervisor: [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "resultats", label: "Résultats", icon: "🏆" },
    { id: "validate-grades", label: "Surveiller notes", icon: "✅" },
    { id: "supervise-teachers", label: "Superviser", icon: "👁️" },
    { id: "all-students", label: "Tous étudiants", icon: "🎓" },
    { id: "all-teachers", label: "Tous enseignants", icon: "👨‍🏫" },
    { id: "detailed-reports", label: "Rapports", icon: "📋" },
    { id: "performance", label: "Performances", icon: "📈" },
    { id: "profile", label: "Profil", icon: "👤" },
  ],
};

function UnifiedDashboard() {
  const { user, isImpersonating, impersonationInfo, stopImpersonation } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [switchError, setSwitchError] = useState("");
  const normalizedRole = normalizeRole(user?.role);
  const navigationItems = navigationByRole[normalizedRole] || navigationByRole.student;

  // Synchroniser avec les URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    if (pageParam) {
      setCurrentPage(pageParam);
    }
  }, []);

  // Mettre à jour l'URL quand la page change
  const handleNavigate = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(window.location.search);
    params.set("page", page);
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  // Si le rôle change (ex: impersonation), garantir une page autorisée.
  useEffect(() => {
    const isCurrentPageAllowed = navigationItems.some((item) => item.id === currentPage);
    if (!isCurrentPageAllowed && navigationItems.length > 0) {
      handleNavigate(navigationItems[0].id);
    }
  }, [currentPage, navigationItems]);

  const handleStopImpersonation = async () => {
    try {
      setSwitchError("");
      await stopImpersonation();
    } catch (err) {
      setSwitchError(err?.message || "Impossible de revenir au mode admin.");
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} navigationItems={navigationItems}>
      {isImpersonating ? (
        <div className="mb-4 border border-amber-600 bg-amber-50 text-amber-900 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium">
            Mode délégation actif: connecté en tant que <strong>{impersonationInfo?.target?.username || user?.username}</strong>
            {impersonationInfo?.admin?.username ? ` (admin d'origine: ${impersonationInfo.admin.username})` : ""}
          </div>
          <button
            type="button"
            onClick={handleStopImpersonation}
            className="px-3 py-1 border border-amber-700 bg-white text-amber-800 text-sm"
          >
            Retour mode admin
          </button>
        </div>
      ) : null}
      {switchError ? <div className="mb-4 text-sm text-red-700">{switchError}</div> : null}
      <DashboardContent currentPage={currentPage} userRole={normalizedRole} />
    </Layout>
  );
}

export default UnifiedDashboard;
