// components/Login.tsx
import { useState } from "react";
import { TextField, Button, Typography, Box, Paper } from "@mui/material";
import { loginUser } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    <Box
      display="flex"
      justifyContent="space-around"
      alignItems="center"
      minHeight="100vh"
      sx={{
        // backgroundImage: "linear-gradient(45deg, #057474, #e6f2f3)"
        backgroundImage: "radial-gradient(ellipse farthest-corner at 65% 50%, var(--primary), var(--secondary), var(--bg-color))"
        // backgroundColor: "#4bb2b2"
        // backgroundImage: "url('/login.svg')",
        // backgroundRepeat: "no-repeat",
        // backgroundSize: "cover",
        // backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          height: "60vh",
          width: "60vh",
          backgroundImage: "url('/logo-name.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      />
      <Paper
        sx={{
          p: 4,
          zIndex: 1,
          maxWidth: "30vw",
          width: "100%",
          borderRadius: 2,
        }}
      >
        <Box>
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
          <Box
            mt={2}
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
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
      </Paper>
    </Box>
  );
}
