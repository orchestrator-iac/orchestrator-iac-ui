import { useEffect, useState } from "react";
import { TextField, Button, Typography, Box, useTheme } from "@mui/material";
import { loginUser } from "../../../services/auth";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

export default function Login() {
  const { login } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const container = document.getElementById("star-container");
    if (!container) return;

    const starCount = 240;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = styles.star;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;

      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // set CSS vars for random twinkle
      star.style.setProperty("--twinkle-duration", `${2 + Math.random() * 4}s`);
      star.style.setProperty("--twinkle-delay", `${Math.random() * 15}s`);

      container.appendChild(star);
    }
  }, []);

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
        setError(
          "The email or password you entered is incorrect. Please try again."
        );
      } else {
        setError(err.message || "Login failed");
      }
    }
  };

  return (
    <Box className={styles.sky}>
      {/* Rotating stars layer */}
      <div className={styles.starsLayer}>
        <div id="star-container"></div>
      </div>
      <Box
        display="flex"
        justifyContent="space-around"
        alignItems="center"
        minHeight="100vh"
      >
        <Box
          sx={{
            p: 4,
            zIndex: 2,
            maxWidth: "25vw",
            width: "100%",
            borderRadius: 2,
            backgroundColor: `${theme.palette.background.default}`,
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
          <Box mt={2} display="flex" justifyContent="space-between">
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{" "}
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
              onClick={() => navigate("/forgot-password")}
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
        </Box>
      </Box>
    </Box>
  );
}
