// src/components/auth/ConfirmEmail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, CircularProgress, Typography, Box } from "@mui/material";
import apiService from "../../services/apiService";

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email"); // optional, useful for resend

  useEffect(() => {
    if (!token) {
      setError("Invalid verification link.");
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        setLoading(true);
        const res = await apiService.get(`/user/verify?token=${token}`);
        if (res.status === 200) {
          toast.success("✅ Email verified successfully!");
          navigate("/login");
        }
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
            "Email verification failed. The link may be expired."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleResend = async () => {
    if (!email) {
      toast.error("No email provided to resend verification.");
      return;
    }
    try {
      setResending(true);
      await apiService.post("/user/resend-verification", { email });
      toast.success("📧 Verification email resent successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.detail || "Failed to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
        <Typography mt={2}>Verifying your email...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        {email && (
          <Button
            variant="contained"
            onClick={handleResend}
            disabled={resending}
            sx={{ mt: 2 }}
          >
            {resending ? "Resending..." : "Resend Verification Email"}
          </Button>
        )}
      </Box>
    );
  }

  return null; // The redirect happens on success
};

export default ConfirmEmail;
