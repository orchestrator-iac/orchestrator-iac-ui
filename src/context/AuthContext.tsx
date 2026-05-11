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
import tokenManager from "../services/tokenManager";
import { AuthContextType, UserProfile } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<object>) => {
  const [token, setToken] = useState<string | null>(
    tokenManager.getAccessToken(),
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  // True while the silent refresh on page-load is in-flight.
  // ProtectedRoute must not redirect until this is false.
  const [isInitializing, setIsInitializing] = useState(true);

  const refreshProfile = async () => {
    try {
      const u = await getProfile();
      setUser(u);
    } catch (e) {
      console.warn("Failed to refresh profile:", e);
      logout();
    }
  };

  // On mount attempt to seed in-memory access token from refresh cookie.
  // isInitializing stays true until this settles so ProtectedRoute won't
  // redirect to /login before we've had a chance to restore the session.
  useEffect(() => {
    (async () => {
      try {
        const newTok = await refreshAccessToken();
        if (newTok) {
          tokenManager.setAccessToken(newTok);
          setToken(newTok);
        }
      } catch (err) {
        // no-op if refresh fails (user not authenticated)
        console.debug("No refresh token available or refresh failed", err);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

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
      refreshTimer = globalThis.setTimeout(async () => {
        try {
          const newTok = await refreshAccessToken();
          login(newTok);
        } catch {
          console.warn("Refresh failed; logging out");
          logout();
        }
      }, refreshIn);

      refreshProfile();
    } catch (err) {
      console.error("Failed to decode token:", err);
      logout();
    }

    return () => {
      if (refreshTimer) globalThis.clearTimeout(refreshTimer);
    };
  }, [token]);

  const login = (newToken: string) => {
    tokenManager.setAccessToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    tokenManager.setAccessToken(null);
    setToken(null);
    setUser(null);
  };

  const googleLogin = async (credential: string) => {
    try {
      const { loginWithGoogle } = await import("../services/auth");
      const token = await loginWithGoogle(credential);
      login(token);
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const contextValue = useMemo(
    () => ({ token, user, isInitializing, login, logout, refreshProfile, googleLogin }),
    [token, user, isInitializing],
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
