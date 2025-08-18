import { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { updatePassword } from "../../../services/auth";
import NightSky from "../../shared/night-sky/NightSky";

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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <NightSky />
      <Box
        sx={{
          p: 4,
          zIndex: 2,
          maxWidth: 400,
          width: "100%",
          borderRadius: 2,
          backgroundColor: "background.default",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Update Password
        </Typography>

        <TextField
          fullWidth
          type="password"
          label="New Password"
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <TextField
          fullWidth
          type="password"
          label="Confirm Password"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
            {success}
          </Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </Box>
    </Box>
  );
}
