import {
  AdminAuditLogsView,
  AllStudents,
  AllTeachers,
  CoursesManagement,
  DashboardOverview,
  DetailedReports,
  EvaluationsManagement,
  GradeEntry,
  GradesHistory,
  GradesManagement,
  MyClasses,
  MyStudents,
  PerformanceMonitoring,
  ReportsView,
  ResultatsView,
  SemestersManagement,
  StatisticsView,
  StudentAverage,
  StudentGrades,
  StudentProfile,
  StudentsManagement,
  SuperviseTeachers,
  TeacherStats,
  UsersManagement,
  ValidateGrades,
  YearsManagement,
} from "./DashboardViews";

const PAGE_COMPONENTS = {
  dashboard: DashboardOverview,
  users: UsersManagement,
  "audit-logs": AdminAuditLogsView,
  students: StudentsManagement,
  courses: CoursesManagement,
  semesters: SemestersManagement,
  years: YearsManagement,
  grades: GradesManagement,
  statistics: StatisticsView,
  reports: ReportsView,
  resultats: ResultatsView,
  "grade-entry": GradeEntry,
  "my-classes": MyClasses,
  "my-students": MyStudents,
  evaluations: EvaluationsManagement,
  "my-stats": TeacherStats,
  "my-grades": StudentGrades,
  "my-average": StudentAverage,
  history: GradesHistory,
  profile: StudentProfile,
  "validate-grades": ValidateGrades,
  "supervise-teachers": SuperviseTeachers,
  "all-students": AllStudents,
  "all-teachers": AllTeachers,
  "detailed-reports": DetailedReports,
  performance: PerformanceMonitoring,
};

function DashboardContent({ currentPage, userRole }) {
  const PageComponent = PAGE_COMPONENTS[currentPage];

  if (!PageComponent) {
    return (
      <div className="bg-white border border-blue-700 p-8 rounded-none text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Page non trouvée</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cette entrée de menu n'est pas encore disponible pour le rôle {userRole || "courant"}.
        </p>
      </div>
    );
  }

  return <PageComponent userRole={userRole} />;
}

export default DashboardContent;
