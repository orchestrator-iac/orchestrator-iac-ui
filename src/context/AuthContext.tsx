import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";

import { getProfile } from "../services/auth";
import { AuthContextType, UserProfile } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<object>) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        console.warn("JWT expired");
        logout();
        return;
      }

      getProfile(token)
        .then(setUser)
        .catch(() => {
          console.warn("Invalid token, logging out");
          logout();
        });
    } catch (err) {
      console.error("Failed to decode token:", err);
      logout();
    }
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
