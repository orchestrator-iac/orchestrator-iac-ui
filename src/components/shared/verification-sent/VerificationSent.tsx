import React, { useState, useEffect } from "react";
import { Box, Typography, Link, useTheme } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

interface VerificationSentProps {
  email: string;
  onResend?: () => void;
  onBackToLogin?: () => void;
  cooldownSeconds?: number;
}

const VerificationSent: React.FC<VerificationSentProps> = ({
  email,
  onResend,
  onBackToLogin,
  cooldownSeconds = 30,
}) => {
  const [timer, setTimer] = useState<number>(0);
  const theme = useTheme();

  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [timer]);

  const handleResendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (timer > 0) return;

    if (onResend) {
      onResend();
      setTimer(cooldownSeconds);
    }
  };

  const handleBackToLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBackToLogin) {
      onBackToLogin();
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        p={4}
        maxWidth="calc(100vw)"
        borderRadius={2}
        sx={{
          backgroundColor: theme.palette.success.light + "20",
          border: `1px solid ${theme.palette.success.main}`,
          boxShadow: 1,
        }}
      >
        <EmailIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: theme.palette.success.main }}
        >
          Verification Email Sent
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={3}>
          A verification email has been sent to <strong>{email}</strong>. Please
          check your inbox and click the link to verify your account.
        </Typography>

        {onResend && (
          <Link
            href="#"
            underline="hover"
            onClick={handleResendClick}
            sx={{
              mb: 1,
              color:
                timer > 0
                  ? theme.palette.text.disabled
                  : theme.palette.success.main,
              pointerEvents: timer > 0 ? "none" : "auto",
              cursor: timer > 0 ? "default" : "pointer",
            }}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend Email"}
          </Link>
        )}

        {onBackToLogin && (
          <Link
            href="#"
            underline="hover"
            color="success.main"
            onClick={handleBackToLoginClick}
          >
            Back to Login
          </Link>
        )}
      </Box>
    </Box>
  );
};

export default VerificationSent;
