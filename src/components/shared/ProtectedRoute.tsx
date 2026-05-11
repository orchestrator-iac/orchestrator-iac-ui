import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { token, isInitializing } = auth ?? {};

  // While the silent token-refresh on page load is in-flight, render nothing
  // rather than redirecting to /login (which would log the user out).
  if (isInitializing) return null;

  return token ? children : <Navigate to="/login" />;
}
