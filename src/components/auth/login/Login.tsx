import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  useTheme,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  alpha,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser } from "../../../services/auth";
import { useAuth } from "../../../context/AuthContext";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";
import NightSky from "../../shared/night-sky/NightSky";

const Login: React.FC = () => {
  const { login } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { redirect?: string })?.redirect || "/home";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resendEmailVerification, setResendEmailVerification] = useState(false);
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth(redirectTo);

  const isDark = theme.palette.mode === "dark";
  const tealMain = isDark ? "#4bbebe" : "#1a5757";
  const tealLight = isDark ? "#7dd3d3" : "#3da9a9";

  const handleLogin = async () => {
    setError("");
    setFieldErrors({});
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password && !loading) {
      handleLogin();
    }
  };

  return (
    <Box position="relative" minHeight="100vh" sx={{ overflow: "hidden" }}>
      <NightSky />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{ position: "relative", zIndex: 2, px: 2 }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 4,
            overflow: "hidden",
            background: isDark
              ? alpha(theme.palette.background.paper, 0.85)
              : alpha(theme.palette.background.paper, 0.96),
            backdropFilter: "blur(24px)",
            border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.07)}`,
            boxShadow: isDark
              ? `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${alpha(tealMain, 0.15)}`
              : "0 32px 80px rgba(0,0,0,0.12)",
          }}
        >
          {/* Teal accent bar */}
          <Box
            sx={{
              height: 4,
              background: `linear-gradient(90deg, ${tealMain}, ${tealLight})`,
            }}
            aria-hidden="true"
          />

          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Brand header */}
            <Box sx={{ mb: 3.5, textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${tealMain}, ${tealLight})`,
                  mb: 2,
                  boxShadow: `0 8px 20px ${alpha(tealMain, 0.35)}`,
                }}
                aria-hidden="true"
              >
                <FontAwesomeIcon icon="lock" style={{ color: "#fff", fontSize: "1.25rem" }} />
              </Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, letterSpacing: "-0.02em", mb: 0.5 }}
              >
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your Orchestrator account
              </Typography>
            </Box>

            {/* Error alert */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.875rem" }}
              >
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" noValidate onKeyDown={handleKeyDown}>
              <TextField
                fullWidth
                label="Email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                slotProps={{ htmlInput: { "aria-label": "Email address", "aria-required": "true" } }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                sx={{
                  mb: 0.5,
                  "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
                }}
                slotProps={{
                  htmlInput: { "aria-label": "Password", "aria-required": "true" },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((v) => !v)}
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

              {/* Forgot / resend row */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2.5, mt: 0.5 }}>
                {resendEmailVerification && (
                  <Typography
                    variant="caption"
                    role="button"
                    tabIndex={0}
                    sx={{
                      color: tealMain,
                      cursor: "pointer",
                      fontWeight: 600,
                      "&:hover": { textDecoration: "underline" },
                      "&:focus-visible": { outline: `2px solid ${tealMain}`, borderRadius: 1 },
                    }}
                    onClick={() => navigate("/email-verification/verify")}
                    onKeyDown={(e) => e.key === "Enter" && navigate("/email-verification/verify")}
                  >
                    Resend verification email
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  role="button"
                  tabIndex={0}
                  sx={{
                    color: "text.secondary",
                    cursor: "pointer",
                    ml: "auto",
                    fontWeight: 500,
                    "&:hover": { color: tealMain, textDecoration: "underline" },
                    "&:focus-visible": { outline: `2px solid ${tealMain}`, borderRadius: 1 },
                  }}
                  onClick={() => navigate("/email-verification/forgot")}
                  onKeyDown={(e) => e.key === "Enter" && navigate("/email-verification/forgot")}
                >
                  Forgot password?
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleLogin}
                disabled={!email || !password || loading}
                aria-label="Sign in to your account"
                startIcon={
                  loading ? (
                    <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "0.9rem" }} />
                  ) : undefined
                }
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: `linear-gradient(135deg, ${tealMain}, ${tealLight})`,
                  boxShadow: `0 6px 20px ${alpha(tealMain, 0.35)}`,
                  "&:hover": {
                    boxShadow: `0 8px 28px ${alpha(tealMain, 0.45)}`,
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                  "&.Mui-disabled": {
                    background: isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06),
                    boxShadow: "none",
                  },
                  transition: "all 0.25s ease",
                }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontWeight: 500 }}>
                OR
              </Typography>
            </Divider>

            <Box display="flex" justifyContent="center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme={isDark ? "filled_black" : "outline"}
                size="large"
                width="100%"
                text="signin_with"
              />
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 3 }}
            >
              Don&apos;t have an account?{" "}
              <Box
                component="span"
                role="button"
                tabIndex={0}
                sx={{
                  color: tealMain,
                  cursor: "pointer",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                  "&:focus-visible": { outline: `2px solid ${tealMain}`, borderRadius: 1 },
                }}
                onClick={() => navigate("/register")}
                onKeyDown={(e) => e.key === "Enter" && navigate("/register")}
              >
                Create one free
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
