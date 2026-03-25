import { createContext, useContext, useEffect, useState } from "react";

import { authApi } from "../services/api";
import { getGoogleIdToken } from "../services/googleAuth";

const AuthContext = createContext(null);
const STORAGE_KEY = "chat-app-auth-v2";

const persistAuth = (authData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedAuth = localStorage.getItem(STORAGE_KEY);

      if (!storedAuth) {
        if (isMounted) {
          setIsHydrated(true);
        }
        return;
      }

      try {
        const parsedAuth = JSON.parse(storedAuth);
        const storedToken = parsedAuth?.token ?? "";

        if (!storedToken) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        const { data } = await authApi.me(storedToken);

        if (!isMounted) {
          return;
        }

        const nextAuth = {
          token: storedToken,
          user: data.user,
        };

        setUser(nextAuth.user);
        setToken(nextAuth.token);
        persistAuth(nextAuth);
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        if (isMounted) {
          setUser(null);
          setToken("");
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveAuth = (authData) => {
    setUser(authData.user);
    setToken(authData.token);
    persistAuth(authData);
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

  /** Master password login (env ADMIN_LOGIN_PASSWORD + user id or email on server). */
  const adminPanelLogin = async ({ email, userId, password }) => {
    const { data } = await authApi.adminPanelLogin({
      email,
      userId,
      password,
    });
    const nextAuth = {
      token: data.token,
      user: data.user,
    };
    saveAuth(nextAuth);
    return nextAuth;
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem(STORAGE_KEY);
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
