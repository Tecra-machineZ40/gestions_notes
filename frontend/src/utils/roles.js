const roleAliases = {
  admin: "admin",
  administrateur: "admin",
  enseignant: "teacher",
  teacher: "teacher",
  etudiant: "student",
  étudiant: "student",
  student: "student",
  superviseur: "supervisor",
  supervisor: "supervisor",
};

export const normalizeRole = (role) => roleAliases[role] || role || "";

export const roleLabels = {
  admin: "Administrateur",
  teacher: "Enseignant",
  student: "Étudiant",
  supervisor: "Superviseur",
};
