import { createContext, useContext, useEffect, useRef, useState } from "react";

import {
  authApi,
  clearAccessToken,
  registerUnauthorizedHandler,
  setAccessToken,
} from "../services/api";
import { getGoogleIdToken } from "../services/googleAuth";

const AuthContext = createContext(null);
const USER_STORAGE_KEY = "chat-app-user-v3";
const LEGACY_AUTH_STORAGE_KEY = "chat-app-auth-v2";

const persistUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
  }, []);

  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const isMountedRef = useRef(true);

  const applyAuthState = (nextToken, nextUser) => {
    setAccessToken(nextToken);
    setToken(nextToken || "");
    setUser(nextUser || null);
    persistUser(nextUser || null);
  };

  const clearAuthState = () => {
    clearAccessToken();
    setToken("");
    setUser(null);
    persistUser(null);
  };

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      if (isMountedRef.current) {
        clearAuthState();
      }
    });

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const restoreSession = async () => {
      try {
        const { data } = await authApi.refresh();
        if (!isMountedRef.current) {
          return;
        }

        applyAuthState(data.token, data.user);
      } catch {
        if (isMountedRef.current) {
          clearAuthState();
        }
      } finally {
        if (isMountedRef.current) {
          setIsHydrated(true);
        }
      }
    };

    restoreSession();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const saveAuth = (authData) => {
    applyAuthState(authData?.token || "", authData?.user || null);
  };

  const login = async ({ email, password }) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const { data } = await authApi.login({ email, password });
    const nextAuth = {
      token: data.token,
      user: data.user,
    };

    saveAuth(nextAuth);
    return nextAuth;
  };

  const register = async ({ name, email, password }) => {
    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }

    const { data } = await authApi.register({ name, email, password });
    const nextAuth = {
      token: data.token,
      user: data.user,
    };

    saveAuth(nextAuth);
    return nextAuth;
  };

  const loginWithGoogle = async () => {
    const idToken = await getGoogleIdToken();
    const { data } = await authApi.loginWithGoogle({ idToken });
    const nextAuth = {
      token: data.token,
      user: data.user,
    };

    saveAuth(nextAuth);
    return nextAuth;
  };

  const adminPanelLogin = async ({ username, password }) => {
    const { data } = await authApi.adminPanelLogin({
      username,
      password,
    });
    const nextAuth = {
      token: data.token,
      user: data.user,
    };
    saveAuth(nextAuth);
    return nextAuth;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear local auth state even if the server session is already gone.
    } finally {
      clearAuthState();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isHydrated,
        saveAuth,
        login,
        register,
        loginWithGoogle,
        adminPanelLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

