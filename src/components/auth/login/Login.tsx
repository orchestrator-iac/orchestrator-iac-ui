import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { loginUser } from "../../../services/auth";
import { useAuth } from "../../../context/AuthContext";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";
import AuthFrame from "../AuthFrame";

const Login: React.FC = () => {
  const { login } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { redirect?: string })?.redirect || "/home";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resendEmailVerification, setResendEmailVerification] = useState(false);
  const {
    handleGoogleSuccess,
    handleGoogleError,
    error: googleError,
    setError: setGoogleError,
  } = useGoogleAuth(redirectTo);

  const isDark = theme.palette.mode === "dark";
  const visibleError = error || googleError;

  const handleLogin = async () => {
    setError("");
    setGoogleError("");
    setFieldErrors({});
    setResendEmailVerification(false);
    setLoading(true);

    try {
      const token = await loginUser({ email, password });
      login(token);
      navigate(redirectTo);
    } catch (err: any) {
      if (err.type === "validation" && err.errors?.properties) {
        const errors = Object.entries(err.errors.properties).reduce(
          (acc, [key, value]: any) => {
            acc[key] = value.errors?.[0] || "Invalid value";
            return acc;
          },
          {} as Record<string, string>,
        );
        setFieldErrors(errors);
      } else if (err?.status === 401) {
        setError("The email or password you entered is incorrect.");
      } else if (err?.status === 403) {
        setError("Email verification required. Please check your inbox.");
        setResendEmailVerification(true);
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleLogin();
  };

  const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError("");
    await handleGoogleSuccess(credentialResponse);
  };

  const onGoogleError = () => {
    setError("");
    handleGoogleError();
  };

  return (
    <AuthFrame
      mode="login"
      title="Welcome back"
      description="Sign in to return to your templates, architecture canvas, and reviewable Terraform workflow."
      alternatePrompt="Don't have an account?"
      alternateLabel="Create an account"
      alternateTo="/register"
    >
      {visibleError && (
        <Alert
          className="auth-error"
          severity="error"
          onClose={() => {
            setError("");
            setGoogleError("");
          }}
        >
          {visibleError}
        </Alert>
      )}

      <Box component="form" className="auth-form" noValidate onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          required
          slotProps={{
            htmlInput: { "aria-label": "Email address", "aria-required": "true" },
          }}
        />
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password}
          required
          slotProps={{
            htmlInput: { "aria-label": "Password", "aria-required": "true" },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
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

        <Box className="auth-form__links">
          {resendEmailVerification && (
            <RouterLink className="auth-text-link" to="/email-verification/verify">
              Resend verification email
            </RouterLink>
          )}
          <RouterLink className="auth-text-link" to="/email-verification/forgot">
            Forgot password?
          </RouterLink>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!email || !password || loading}
          aria-label="Sign in to your account"
          startIcon={
            loading ? (
              <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "0.9rem" }} />
            ) : undefined
          }
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <Divider>OR</Divider>

        <Box className="auth-google">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            theme={isDark ? "filled_black" : "outline"}
            size="large"
            width={400}
            text="signin_with"
          />
        </Box>
      </Box>
    </AuthFrame>
  );
};

export default Login;
