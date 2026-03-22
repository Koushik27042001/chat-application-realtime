import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const createAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const authApi = {
  register: (payload) => apiClient.post("/auth/register", payload),
  login: (payload) => apiClient.post("/auth/login", payload),
  me: (token) => apiClient.get("/auth/me", createAuthConfig(token)),
};

export const messageApi = {
  list: (token, userId) =>
    apiClient.get(`/messages?userId=${userId}`, createAuthConfig(token)),
  send: (token, payload) =>
    apiClient.post("/messages", payload, createAuthConfig(token)),
};

export const userApi = {
  list: (token, search = "") => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.get(`/users${query}`, createAuthConfig(token));
  },
  get: (token, userId) =>
    apiClient.get(`/users/${userId}`, createAuthConfig(token)),
};
