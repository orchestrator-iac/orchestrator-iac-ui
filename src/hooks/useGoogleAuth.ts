import type { CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface UseGoogleAuthReturn {
  handleGoogleSuccess: (credentialResponse: CredentialResponse) => Promise<void>;
  handleGoogleError: () => void;
  error: string;
  setError: (error: string) => void;
}

export const useGoogleAuth = (redirectTo = "/home"): UseGoogleAuthReturn => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [error, setError] = useState<string>("");

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google authentication failed. Please try again.");
      return;
    }

    try {
      await googleLogin(credentialResponse.credential);
      navigate(redirectTo);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Google authentication failed",
      );
    }
  };

  const handleGoogleError = () => {
    setError("Google authentication failed. Please try again.");
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
    error,
    setError,
  };
};
