import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";

import { getProfile, refreshAccessToken } from "../services/auth";
import { AuthContextType, UserProfile } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<object>) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!token) return;

    let refreshTimer: number | undefined;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        console.warn("JWT expired");
        logout();
        return;
      }

      // Proactive refresh ~2 minutes before expiry
      const msToExpiry = decoded.exp * 1000 - Date.now();
      const refreshIn = Math.max(msToExpiry - 2 * 60 * 1000, 0);
      refreshTimer = window.setTimeout(async () => {
        try {
          const newTok = await refreshAccessToken();
          login(newTok);
        } catch {
          console.warn("Refresh failed; logging out");
          logout();
        }
      }, refreshIn);

      getProfile()
        .then(setUser)
        .catch(() => {
          console.warn("Invalid token, logging out");
          logout();
        });
    } catch (err) {
      console.error("Failed to decode token:", err);
      logout();
    }

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
    };
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const contextValue = useMemo(
    () => ({ token, user, login, logout }),
    [token, user]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
