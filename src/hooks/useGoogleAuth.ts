import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface UseGoogleAuthReturn {
  handleGoogleSuccess: (credentialResponse: any) => Promise<void>;
  handleGoogleError: () => void;
  error: string;
  setError: (error: string) => void;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [error, setError] = useState<string>("");

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/home");
    } catch (err: any) {
      setError(err?.message || "Google authentication failed");
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
