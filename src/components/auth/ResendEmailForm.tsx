import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Alert, Box, Button, TextField } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import apiService from "../../services/apiService";
import AuthFrame from "./AuthFrame";

const getRequestErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response;
    if (response && typeof response === "object" && "data" in response) {
      const data = response.data;
      if (data && typeof data === "object") {
        if ("message" in data && typeof data.message === "string") {
          return data.message;
        }
        if ("detail" in data && typeof data.detail === "string") {
          return data.detail;
        }
      }
    }
  }

  return "Something went wrong. Try again.";
};

export default function ResendEmail() {
  const { type } = useParams<{ type: "verify" | "forgot" }>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isVerificationRequest = type === "verify";
  const isSupportedRequest = isVerificationRequest || type === "forgot";
  const title = isVerificationRequest
    ? "Resend verification email"
    : "Forgot your password?";
  const description = isVerificationRequest
    ? "Enter your email and we’ll send a fresh link to verify your Orchestrator account."
    : "Enter your email and we’ll send a secure link to choose a new password.";
  const buttonLabel = isVerificationRequest
    ? "Send verification email"
    : "Send reset link";

  if (!isSupportedRequest) {
    return (
      <AuthFrame
        mode="recovery"
        title="Request not available"
        description="This email request is not available. Return to sign in and try again."
        alternatePrompt="Ready to continue?"
        alternateLabel="Sign in"
        alternateTo="/login"
      >
        <Alert className="auth-error" severity="error">
          The requested email action is invalid or has expired.
        </Alert>
      </AuthFrame>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiService.post("/user/email-verification", { email, type });

      setSuccessMessage(
        type === "verify"
          ? "Verification email has been sent. Please check your inbox."
          : "Password reset link has been sent. Please check your inbox.",
      );
    } catch (err: unknown) {
      setErrorMessage(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      mode="recovery"
      title={title}
      description={description}
      alternatePrompt="Remember your password?"
      alternateLabel="Sign in"
      alternateTo="/login"
    >
      {errorMessage && (
        <Alert
          className="auth-error"
          severity="error"
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert
          className="auth-success"
          severity="success"
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      <Box
        component="form"
        className="auth-form"
        noValidate
        onSubmit={handleSubmit}
      >
        <TextField
          label="Email"
          type="email"
          fullWidth
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!email || loading}
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
          {loading ? "Sending…" : buttonLabel}
        </Button>
      </Box>
    </AuthFrame>
  );
}
