import api from "./axios";

export const getUsers = async (filters = {}) => {
  const response = await api.get("/utilisateurs/", { params: filters });
  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post("/utilisateurs/", payload);
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.patch(`/utilisateurs/${id}/`, payload);
  return response.data;
};

export const deleteUser = async (id) => {
  await api.delete(`/utilisateurs/${id}/`);
  return { success: true };
};

export const setUserPassword = async (id, password) => {
  const response = await api.post(`/utilisateurs/${id}/set_password/`, { password });
  return response.data;
};

export const impersonateUser = async (id) => {
  const response = await api.post(`/utilisateurs/${id}/impersonate/`);
  return response.data;
};

export const getAdminAuditLogs = async (filters = {}) => {
  const response = await api.get('/admin-audit-logs/', { params: filters });
  return response.data;
};

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  setUserPassword,
  impersonateUser,
  getAdminAuditLogs,
};
