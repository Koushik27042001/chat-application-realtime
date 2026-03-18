import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "chat-app-auth";

const persistAuth = (authData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);

    if (!storedAuth) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsedAuth = JSON.parse(storedAuth);
      setUser(parsedAuth.user ?? null);
      setToken(parsedAuth.token ?? "");
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const saveAuth = (authData) => {
    setUser(authData.user);
    setToken(authData.token);
    persistAuth(authData);
  };

  const loginMock = ({ email, password }) => {
    const nextAuth = {
      token: `mock-token-${Date.now()}`,
      user: {
        id: "mock-user-1",
        name: email?.split("@")[0] || "Demo User",
        email,
      },
    };

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    saveAuth(nextAuth);
    return nextAuth;
  };

  const registerMock = ({ name, email, password }) => {
    const nextAuth = {
      token: `mock-token-${Date.now()}`,
      user: {
        id: "mock-user-1",
        name: name || "Demo User",
        email,
      },
    };

    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }

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
        loginMock,
        registerMock,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
