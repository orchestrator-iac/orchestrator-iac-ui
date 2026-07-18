import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";

import {
  getProfile,
  logoutUser,
  refreshAccessToken,
} from "../services/auth";
import {
  clearLoggedOutMarker,
  hasLoggedOutMarker,
  markLoggedOut,
} from "../services/sessionState";
import tokenManager from "../services/tokenManager";
import { AuthContextType, UserProfile } from "../types/auth";
import { resetAppState } from "../store/appActions";
import type { AppDispatch } from "../store";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JwtUserClaims {
  sub: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  job_role?: string;
  imageUrl?: string;
  themePreference?: string;
  perms?: string[];
  exp: number;
}

function userFromToken(token: string): UserProfile | null {
  try {
    const c = jwtDecode<JwtUserClaims>(token);
    return {
      email:              c.email ?? c.sub,
      firstName:          c.firstName ?? "",
      lastName:           c.lastName ?? "",
      company:            c.company,
      job_role:           c.job_role,
      imageUrl:           c.imageUrl,
      themePreference:    c.themePreference as UserProfile["themePreference"],
      assignedPermissions: c.perms ?? [],
    };
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: PropsWithChildren<object>) => {
  const dispatch = useDispatch<AppDispatch>();
  const [token, setToken] = useState<string | null>(
    tokenManager.getAccessToken(),
  );
  const [user, setUser] = useState<UserProfile | null>(() => {
    const t = tokenManager.getAccessToken();
    return t ? userFromToken(t) : null;
  });
  // True while the silent refresh on page-load is in-flight.
  // ProtectedRoute must not redirect until this is false.
  const [isInitializing, setIsInitializing] = useState(true);

  const clearTransientSessionState = () => {
    dispatch(resetAppState());

    try {
      sessionStorage.removeItem("maestro_prefill");
    } catch {
      // Best-effort only.
    }
  };

  const applyToken = (
    newToken: string,
    { resetState = false }: { resetState?: boolean } = {},
  ) => {
    if (resetState) {
      clearTransientSessionState();
    }

    clearLoggedOutMarker();
    tokenManager.setAccessToken(newToken);
    setToken(newToken);
    setUser(userFromToken(newToken));
  };

  // Keep profile in sync with latest server data (called after profile edits,
  // image uploads, etc. — NOT on every page load).
  const refreshProfile = async () => {
    try {
      const u = await getProfile();
      setUser(u);
    } catch (e) {
      console.warn("Failed to refresh profile:", e);
      void logout();
    }
  };

  // On mount attempt to seed in-memory access token from refresh cookie.
  // isInitializing stays true until this settles so ProtectedRoute won't
  // redirect to /login before we've had a chance to restore the session.
  // AbortController cancels the inflight request on StrictMode's
  // double-invoke so the silent refresh only completes once.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        // If we're already on the login page, skip the silent refresh.
        if (
          globalThis.window !== undefined &&
          (globalThis.location.pathname === "/login" ||
            hasLoggedOutMarker())
        ) {
          setIsInitializing(false);
          return;
        }

        const newTok = await refreshAccessToken(controller.signal);
        if (newTok) {
          applyToken(newTok);
        }
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        // Clear auth state if silent refresh fails. ProtectedRoute owns
        // redirecting protected pages; public pages must stay public.
        console.debug("No refresh token available or refresh failed", err);
        try {
          tokenManager.clearAccessToken();
        } catch (e) {
          console.debug("AuthContext: failed to clear access token", e);
        }
        setToken(null);
        setUser(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsInitializing(false);
        }
      }
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!token) return;

    let refreshTimer: number | undefined;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        console.warn("JWT expired");
        void logout();
        return;
      }

      // Populate user directly from token — no extra API call needed.
      setUser(userFromToken(token));

      // Proactive refresh ~2 minutes before expiry
      const msToExpiry = decoded.exp * 1000 - Date.now();
      const refreshIn = Math.max(msToExpiry - 2 * 60 * 1000, 0);
      refreshTimer = globalThis.setTimeout(async () => {
        try {
          const newTok = await refreshAccessToken();
          applyToken(newTok);
        } catch {
          console.warn("Refresh failed; logging out");
          void logout();
        }
      }, refreshIn);
    } catch (err) {
      console.error("Failed to decode token:", err);
      void logout();
    }

    return () => {
      if (refreshTimer) globalThis.clearTimeout(refreshTimer);
    };
  }, [token]);

  const login = (newToken: string) => {
    applyToken(newToken, { resetState: true });
  };

  const logout = async () => {
    markLoggedOut();
    tokenManager.setAccessToken(null);
    setToken(null);
    setUser(null);
    clearTransientSessionState();

    try {
      await logoutUser();
    } catch (error) {
      console.warn("Failed to clear server session during logout:", error);
    }
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

  const hasPermission = (permission: string): boolean => {
    const perms = user?.assignedPermissions ?? [];
    // Admin is a master role — grants all permissions.
    if (perms.includes("admin")) return true;
    return perms.includes(permission);
  };

  const contextValue = useMemo(
    () => ({
      token,
      user,
      isInitializing,
      login,
      logout,
      refreshProfile,
      googleLogin,
      hasPermission,
    }),
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
