import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { updatePassword } from "../../../services/auth";
import AuthFrame from "../AuthFrame";

interface UpdatePasswordRequest {
  token: string | null;
  newPassword: string;
}

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token: string | null = searchParams.get("token");

  const handleSubmit = async (): Promise<void> => {
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!token) {
      setError("This password reset link is missing or invalid.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const payload: UpdatePasswordRequest = { token, newPassword };
      await updatePassword(payload);
      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      mode="recovery"
      title="Choose a new password"
      description="Set a new password for your Orchestrator account, then return to your workspace."
      alternatePrompt="Need another reset link?"
      alternateLabel="Request one"
      alternateTo="/email-verification/forgot"
    >
      {error && (
        <Alert
          className="auth-error"
          severity="error"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert className="auth-success" severity="success">
          {success}
        </Alert>
      )}

      <Box
        component="form"
        className="auth-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <TextField
          fullWidth
          type={showPassword ? "text" : "password"}
          label="New Password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          required
          slotProps={{
            htmlInput: {
              "aria-label": "New password",
              "aria-required": "true",
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                    edge="end"
                    size="small"
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? "eye-slash" : "eye"}
                      style={{ fontSize: "0.85rem" }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          fullWidth
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          required
          slotProps={{
            htmlInput: {
              "aria-label": "Confirm password",
              "aria-required": "true",
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    edge="end"
                    size="small"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? "eye-slash" : "eye"}
                      style={{ fontSize: "0.85rem" }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={
            loading ? (
              <FontAwesomeIcon
                icon="spinner"
                spin
                style={{ fontSize: "0.9rem" }}
              />
            ) : undefined
          }
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
      </Box>
    </AuthFrame>
  );
}
