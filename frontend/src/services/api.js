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

// Unwrap enterprise ApiResponse format: { status, statusCode, message, data }
apiClient.interceptors.response.use((res) => {
  if (res?.data?.data !== undefined && res?.data?.status) {
    res.data = res.data.data;
  }
  return res;
});

export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const authApi = {
  register: (payload) => apiClient.post("/auth/register", payload),
  login: (payload) => apiClient.post("/auth/login", payload),
  me: (token) => apiClient.get("/auth/me", createAuthConfig(token)),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    apiClient.post(`/auth/reset-password/${token}`, { password }),
  sendOTP: (email) => apiClient.post("/auth/send-otp", { email }),
  verifyOTP: (payload) => apiClient.post("/auth/verify-otp", payload),
};

export const messageApi = {
  list: (token, conversationId, page = 0, limit = 20) =>
    apiClient.get(
      `/messages?conversationId=${conversationId}&page=${page}&limit=${limit}`,
      createAuthConfig(token)
    ),
  send: (token, payload) =>
    apiClient.post("/messages", payload, createAuthConfig(token)),
};

export const conversationApi = {
  withUser: (token, userId) =>
    apiClient.get(`/conversations/with/${userId}`, createAuthConfig(token)),
};

export const userApi = {
  list: (token, search = "") => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.get(`/users${query}`, createAuthConfig(token));
  },
  get: (token, userId) =>
    apiClient.get(`/users/${userId}`, createAuthConfig(token)),
};
