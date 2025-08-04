// components/Login.tsx
import { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { loginUser } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const token = await loginUser({email, password});
      login(token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5">Login</Typography>
      <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <Typography color="error">{error}</Typography>}
      <Box mt={2}>
        <Button variant="outlined" fullWidth onClick={() => navigate("/register")}>
          Register
        </Button>
      </Box>
      <Box mt={2}>
        <Button variant="contained" fullWidth onClick={handleLogin} disabled={!email || !password}>
          Login
        </Button>
      </Box>
      <Box mt={2}>
        <Typography variant="body2" color="textSecondary">
          Don't have an account? <Button onClick={() => navigate("/register")}>Register</Button>
        </Typography>
      </Box>
      <Box mt={2}>
        <Button variant="outlined" fullWidth onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
      <Box mt={2}>
        <Button variant="outlined" fullWidth onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </Button>
      </Box>
    </Box>
  );
}
