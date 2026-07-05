// components/Register.tsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Grid,
  Alert,
  useTheme,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { registerUser } from "../../../services/auth";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";
import NightSky from "../../shared/night-sky/NightSky";

import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth();

  const handleChange = (e: any) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async () => {
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        company: form.company,
        job_role: form.job_role,
        password: form.password,
      });
      navigate("/register-success");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
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
            maxWidth: "35vw",
            width: "100%",
            borderRadius: 2,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Register
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
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
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                select
                label="Job Role"
                name="job_role"
                value={form.job_role}
                onChange={handleChange}
              >
                {jobFunctions.map((jf) => (
                  <MenuItem key={jf} value={jf}>
                    {jf}
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
                required
                slotProps={{
                  htmlInput: {
                    "aria-label": "Password",
                    "aria-required": "true",
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
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
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                required
                slotProps={{
                  htmlInput: {
                    "aria-label": "Password",
                    "aria-required": "true",
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showConfirmPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowConfirmPassword((v) => !v)}
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

          {error && (
            <Box mt={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{" "}
              <Box
                component="span"
                sx={{ color: "primary.main", cursor: "pointer" }}
                onClick={() => navigate("/login")}
              >
                Login
              </Box>
            </Typography>
          </Box>
          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleRegister}
            >
              Register
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

export default Register;
