import { ThemeMode } from "../components/shared/theme/ThemeContext";

export interface Register {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  role: string;
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
  role: string;
  company?: string;
  imageUrl?: string;
  themePreference?: ThemeMode;
}

export interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
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
