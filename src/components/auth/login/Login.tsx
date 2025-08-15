import { useEffect, useState } from "react";
import { TextField, Button, Typography, Box, Paper } from "@mui/material";
import { loginUser } from "../../../services/auth";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const container = document.getElementById("star-container");
    if (!container) return;

    const starCount = 120;
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
      star.style.setProperty("--twinkle-delay", `${Math.random() * 5}s`);

      container.appendChild(star);
    }
  }, []);

  useEffect(() => {
    const container = document.getElementById("cloud-container");
    if (!container) return;

    const cloudCount = 6;

    for (let i = 0; i < cloudCount; i++) {
      const cloud = document.createElement("div");
      cloud.className = styles.cloud;

      // Random cloud position
      cloud.style.top = `${Math.random() * 70}%`;
      cloud.style.left = `${Math.random() * 80}%`;
      cloud.style.animationDuration = `${12 + Math.random() * 8}s`;

      // Create multiple puffs for irregular cloud shape
      const puffCount = Math.floor(Math.random() * 5) + 4; // 4–8 puffs
      for (let j = 0; j < puffCount; j++) {
        const puff = document.createElement("div");
        puff.className = styles["cloud-puff"];

        // Random puff size
        const puffSize = Math.random() * 50 + 40; // 40–90px
        puff.style.width = `${puffSize}px`;
        puff.style.height = `${puffSize}px`;

        // Position puffs relative to the center of cloud
        const offsetX = (Math.random() - 0.5) * 150; // spread horizontally
        const offsetY = (Math.random() - 0.5) * 50; // spread vertically
        puff.style.left = `${offsetX}px`;
        puff.style.top = `${offsetY}px`;

        // Slight transparency for depth
        puff.style.opacity = `${0.7 + Math.random() * 0.3}`;

        cloud.appendChild(puff);
      }

      container.appendChild(cloud);
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
        <div id="cloud-container"></div>
      </div>

      {/* Static clouds layer */}
      {/* <div className={`${styles.cloud} ${styles.cloud1}`}></div>
      <div className={`${styles.cloud} ${styles.cloud2}`}></div>
      <div className={`${styles.cloud} ${styles.cloud3}`}></div>
      <div className={`${styles.cloud} ${styles.cloud4}`}></div> */}

      {/* Login UI */}
      <Box
        display="flex"
        justifyContent="space-around"
        alignItems="center"
        minHeight="100vh"
      >
        {/* <Box
          sx={{
            height: "60vh",
            width: "60vh",
            backgroundImage: "url('/logo-name.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
            zIndex: 2,
          }}
        /> */}
        {/* <Paper
          sx={{
            p: 4,
            zIndex: 2,
            maxWidth: "30vw",
            width: "100%",
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.9)",
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
        </Paper> */}
      </Box>
    </Box>
  );
}
