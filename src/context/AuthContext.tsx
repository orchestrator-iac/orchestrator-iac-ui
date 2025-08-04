import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
  useMemo,
} from "react";
import { getProfile } from "../services/auth";

// Define your User type instead of using `any`
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  // Add more fields as per your backend response
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<object>) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (token) {
      getProfile(token)
        .then((profile) => setUser(profile))
        .catch(() => logout());
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
