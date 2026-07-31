import api from "../api/axios";

// 🔐 Fonction de connexion
// Envoie username et password, récupère les tokens JWT
export const login = async (username, password) => {
  const response = await api.post("token/", {
    username,
    password,
  });

  // Sauvegarde des tokens dans le navigateur (localStorage)
  localStorage.setItem("access", response.data.access);
  localStorage.setItem("refresh", response.data.refresh);

  return response.data;
};

export const activateAccount = async ({ username, password, code_inscription }) => {
  const response = await api.post("activate-account/", {
    username,
    password,
    code_inscription,
  });

  localStorage.setItem("access", response.data.access);
  localStorage.setItem("refresh", response.data.refresh);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("me/");
  return response.data;
};

// ✍️ Fonction d'inscription avec preuve
// Envoie la demande au backend pour validation admin
export const signup = async (data) => {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("email", data.email);
  formData.append("password", data.password);

  if (data.preuve_appartenance instanceof File) {
    formData.append("preuve_appartenance", data.preuve_appartenance);
  }

  const response = await api.post("register/", formData);
  return response.data;
};
