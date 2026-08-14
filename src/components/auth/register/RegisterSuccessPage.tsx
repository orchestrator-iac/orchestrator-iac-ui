import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VerificationSent from "../../shared/verification-sent/VerificationSent";
import apiService from "../../../services/apiService";

const getEmailFromState = (state: unknown): string => {
  if (state && typeof state === "object" && "email" in state) {
    const email = (state as { email?: unknown }).email;
    return typeof email === "string" ? email : "";
  }
  return "";
};

const RegisterSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = getEmailFromState(location.state);

  const handleResend = async () => {
    if (!email) return;
    try {
      await apiService.post("/user/email-verification", {
        email,
        type: "verify",
      });
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <VerificationSent
      email={email}
      onResend={handleResend}
      onBackToLogin={handleBackToLogin}
    />
  );
};

export default RegisterSuccessPage;
