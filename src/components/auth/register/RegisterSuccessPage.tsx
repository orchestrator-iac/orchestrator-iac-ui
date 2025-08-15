import React, { useState } from "react";
import VerificationSent from "../../shared/verification-sent/VerificationSent";

const RegisterSuccessPage: React.FC = () => {
  const [email] = useState("user@example.com");

  const handleResend = () => {
    // Call your API to resend verification email
    console.log("Resend verification email");
  };

  const handleBackToLogin = () => {
    // Navigate back to login page
    console.log("Back to login");
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
