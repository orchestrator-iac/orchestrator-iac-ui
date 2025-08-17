import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VerificationSent from "../../shared/verification-sent/VerificationSent";


const RegisterSuccessPage: React.FC = () => {
  const [email] = useState("user@example.com");
  const navigate = useNavigate();

  const handleResend = () => {
    // Call your API to resend verification email
    console.log("Resend verification email");
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
