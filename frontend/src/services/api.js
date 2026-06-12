import axios from "axios";

/** In dev, default to Vite proxy (`/api`). In prod, set VITE_API_URL to your Render URL. */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "/api" : "http://localhost:5000/api");

let accessToken = "";
let refreshPromise = null;
let unauthorizedHandler = () => {};

export const setAccessToken = (token) => {
  accessToken = token || "";
};

export const clearAccessToken = () => {
  accessToken = "";
};

export const registerUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === "function" ? handler : () => {};
};

const createAuthConfig = () => ({
  headers: accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : {},
});

const shouldSkipRefresh = (url = "") =>
  [
    "/auth/login",
    "/auth/register",
    "/auth/google",
    "/auth/admin-login",
    "/auth/refresh",
    "/auth/logout",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/send-otp",
    "/auth/verify-otp",
  ].some((path) => url.includes(path));

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.token);
        return data.token;
      })
      .catch((error) => {
        clearAccessToken();
        unauthorizedHandler();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  nextConfig.headers = nextConfig.headers || {};

  if (!nextConfig.headers.Authorization && accessToken) {
    nextConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return nextConfig;
});

apiClient.interceptors.response.use(
  (res) => {
    if (res?.data?.data !== undefined && res?.data?.status) {
      res.data = res.data.data;
    }
    return res;
  },
  async (error) => {
    const originalRequest = error?.config || {};
    const status = error?.response?.status;

    if (
      status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5000";

export const authApi = {
  register: (payload) => apiClient.post("/auth/register", payload),
  login: (payload) => apiClient.post("/auth/login", payload),
  loginWithGoogle: (payload) => apiClient.post("/auth/google", payload),
  adminPanelLogin: (payload) => apiClient.post("/auth/admin-login", payload),
  refresh: () => apiClient.post("/auth/refresh"),
  logout: () => apiClient.post("/auth/logout"),
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
  markRead: (token, conversationId) =>
    apiClient.patch(
      "/messages/read",
      { conversationId },
      createAuthConfig(token)
    ),
  send: (token, payload) =>
    apiClient.post("/messages", payload, createAuthConfig(token)),
};

export const conversationApi = {
  list: (token) => apiClient.get("/conversations", createAuthConfig(token)),
  withUser: (token, userId) =>
    apiClient.get(`/conversations/with/${userId}`, createAuthConfig(token)),
  // 🔥 GROUP OPERATIONS
  createGroup: (token, payload) =>
    apiClient.post("/conversations/group/create", payload, createAuthConfig(token)),
  getGroupDetails: (token, groupId) =>
    apiClient.get(`/conversations/group/${groupId}`, createAuthConfig(token)),
  addGroupMember: (token, payload) =>
    apiClient.post("/conversations/group/add-member", payload, createAuthConfig(token)),
  removeGroupMember: (token, payload) =>
    apiClient.post("/conversations/group/remove-member", payload, createAuthConfig(token)),
  updateGroupInfo: (token, groupId, payload) =>
    apiClient.patch(`/conversations/group/${groupId}`, payload, createAuthConfig(token)),
};

export const adminApi = {
  analytics: (token) =>
    apiClient.get("/admin/analytics", createAuthConfig(token)),
};

export const notificationApi = {
  list: (token, page = 0, limit = 20) =>
    apiClient.get(
      `/notifications?page=${page}&limit=${limit}`,
      createAuthConfig(token)
    ),
  markRead: (token, id) =>
    apiClient.patch(`/notifications/${id}/read`, {}, createAuthConfig(token)),
  markAllRead: (token) =>
    apiClient.patch("/notifications/read-all", {}, createAuthConfig(token)),
};

export const uploadApi = {
  image: (token, image) =>
    apiClient.post("/uploads/image", { image }, createAuthConfig(token)),
};

export const userApi = {
  list: (token, search = "") => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.get(`/users${query}`, createAuthConfig(token));
  },
  get: (token, userId) =>
    apiClient.get(`/users/${userId}`, createAuthConfig(token)),
  updateAvatar: (token, avatar) =>
    apiClient.patch("/users/me/avatar", { avatar }, createAuthConfig(token)),
};

