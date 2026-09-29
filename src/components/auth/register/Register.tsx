import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  useTheme,
} from "@mui/material";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { registerUser } from "../../../services/auth";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";
import AuthFrame from "../AuthFrame";

const jobFunctions = [
  "Developer",
  "DevOps Engineer",
  "Cloud Architect",
  "Product Manager",
  "Other",
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    job_role: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    handleGoogleSuccess,
    handleGoogleError,
    error: googleError,
    setError: setGoogleError,
  } = useGoogleAuth();
  const visibleError = error || googleError;
  const isDark = theme.palette.mode === "dark";

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleRegister = async () => {
    setError("");
    setGoogleError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        company: form.company,
        job_role: form.job_role,
        password: form.password,
      });
      navigate("/register-success", { state: { email: form.email } });
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleRegister();
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
      mode="register"
      title="Create your account"
      description="Start with a reusable blueprint, shape the architecture, and leave with infrastructure your team can inspect."
      alternatePrompt="Already have an account?"
      alternateLabel="Sign in"
      alternateTo="/login"
    >
      <Box className="auth-form" component="form" noValidate onSubmit={handleSubmit}>
        <Box className="auth-google">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            theme={isDark ? "filled_black" : "outline"}
            size="large"
            width="100%"
          />
        </Box>

        <Divider>OR SIGN UP WITH EMAIL</Divider>

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

        <Grid container spacing={2} className="auth-register-grid">
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={form.company}
              onChange={handleChange}
              autoComplete="organization"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              select
              label="Job role"
              name="job_role"
              value={form.job_role}
              onChange={handleChange}
            >
              {jobFunctions.map((jobFunction) => (
                <MenuItem key={jobFunction} value={jobFunction}>
                  {jobFunction}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
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
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              slotProps={{
                htmlInput: { "aria-label": "Confirm password", "aria-required": "true" },
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
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={
            loading ? (
              <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "0.9rem" }} />
            ) : undefined
          }
        >
          {loading ? "Creating account…" : "Create account with email"}
        </Button>
      </Box>

      <Box className="auth-form__legal">
        By creating an account, you can save reusable architecture workspaces
        and continue into the visual design workflow.
      </Box>
    </AuthFrame>
  );
};

export default Register;
