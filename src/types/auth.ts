import { ThemeMode } from "../components/shared/theme/ThemeContext";

export interface Register {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  job_role?: string;
  password: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface UserProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  /** Job role declared by the user — analytics only, never used for authorization. */
  job_role?: string;
  company?: string;
  imageUrl?: string;
  themePreference?: ThemeMode;
  /** Permissions assigned by an admin — used for all access control decisions. */
  assignedPermissions?: string[];
  /** Permissions the user has requested (analytics / admin review only). */
  requestedPermissions?: string[];
}

export interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  /** True while the initial silent refresh is in-flight on page load. */
  isInitializing: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  /** Returns true when the current user holds the given permission. */
  hasPermission: (permission: string) => boolean;
}

export interface ImageUpdate {
  imageBase64: string;
}

export interface UpdatePasswordRequest {
  token: string | null;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  msg: string;
}
