import { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import NightSky from "../shared/night-sky/NightSky";
import apiService from "../../services/apiService";

export default function ResendEmail() {
  const { type } = useParams<{ type: "verify" | "forgot" }>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!type || (type !== "verify" && type !== "forgot")) {
    return <Box p={4}>Invalid request type</Box>;
  }

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiService.post("/user/email-verification", { email, type });

      setSuccessMessage(
        type === "verify"
          ? "Verification email has been sent. Please check your inbox."
          : "Password reset link has been sent. Please check your inbox."
      );
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Something went wrong. Try again."
      );
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
        <Typography variant="h6" textAlign="center" mb={2}>
          {type === "verify" ? "Resend Verification Email" : "Forgot Password"}
        </Typography>

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={!email || loading}
        >
          {loading ? "Sending..." : "Submit"}
        </Button>
      </Box>
    </Box>
  );
}
