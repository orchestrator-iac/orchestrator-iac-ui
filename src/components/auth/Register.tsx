// components/Register.tsx
import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Grid,
  Alert,
} from "@mui/material";
import { registerUser } from "../../services/auth";
import { useNavigate } from "react-router-dom";

const roles = [
  "Developer",
  "DevOps Engineer",
  "Cloud Architect",
  "Product Manager",
  "Other",
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

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
        role: form.role,
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <Box p={3} maxWidth="600px" mx="auto">
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
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
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Company"
            name="company"
            value={form.company}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Current Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </Grid>
      </Grid>

      {error && (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Box mt={3}>
        <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>
          Register
        </Button>
      </Box>
    </Box>
  );
}
