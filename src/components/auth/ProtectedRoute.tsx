// components/ProtectedRoute.tsx
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const token = auth?.token;
  return token ? children : <Navigate to="/login" />;
}
