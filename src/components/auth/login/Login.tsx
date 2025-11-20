import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box, useTheme, Divider } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser } from "../../../services/auth";
import { useAuth } from "../../../context/AuthContext";
import NightSky from "../../shared/night-sky/NightSky";

const Login: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resendEmailVerification, setResendEmailVerification] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/home");
    } catch (err: any) {
      setError(err?.message || "Google login failed");
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  const handleLogin = async () => {
    setError("");
    setFieldErrors({});
    try {
      const token = await loginUser({ email, password });
      login(token);
      navigate("/home");
    } catch (err: any) {
      if (err.type === "validation" && err.errors?.properties) {
        const errors = Object.entries(err.errors.properties).reduce(
          (acc, [key, value]: any) => {
            acc[key] = value.errors?.[0] || "Invalid value";
            return acc;
          },
          {} as Record<string, string>
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
    }
  };

  return (
    <Box position="relative" height="100vh">
      <NightSky />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ position: "relative", zIndex: 2 }}
      >
        <Box
          sx={{
            p: 4,
            maxWidth: "25vw",
            width: "100%",
            borderRadius: 2,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Typography variant="h5">Login</Typography>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
          />
          {error && <Typography color="error">{error}</Typography>}
          {resendEmailVerification && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/email-verification/verify")}
            >
              Resend Email Verification
            </Typography>
          )}
          <Box mt={2} display="flex" justifyContent="space-between">
            <Typography variant="body2" color="textSecondary">
              Don&apos;t have an account?{" "}
              <Box
                component="span"
                sx={{ color: "primary.main", cursor: "pointer" }}
                onClick={() => navigate("/register")}
              >
                Register
              </Box>
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/email-verification/forgot")}
            >
              Forgot Password?
            </Typography>
          </Box>
          <Box mt={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={!email || !password}
            >
              Login
            </Button>
          </Box>
          <Box mt={2}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="textSecondary">
                OR
              </Typography>
            </Divider>
            <Box display="flex" justifyContent="center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100%"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
