import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { initializeCsrfProtection } from "../utils/csrf";
import AuthContext from "./authContextInstance";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    const restoreSession = async () => {
      try {
        // Initialize CSRF protection
        await initializeCsrfProtection();
        
        const response = await api.get("/auth/me");
        if (!cancelled) {
          setUser(response.data.user || null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    restoreSession();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    return response.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      initialized,
      isAuthenticated: Boolean(user),
      login,
      logout,
      register,
      setUser,
    }),
    [user, loading, initialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
