// pages/Profile.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import axios from "axios";

import { useAuth } from "../../../context/AuthContext";
import { UserProfile } from "../../../types/auth";

const roles = [
  "Developer",
  "DevOps Engineer",
  "Cloud Architect",
  "Product Manager",
  "Other",
];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [updated, setUpdated] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        role: user.role ?? "",
        company: user.company ?? "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!profile) return;

    setProfile({ ...profile, [name]: value });
    setUpdated(true);

    // Clear error for the field if it was previously empty
    if (value.trim() && errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate required fields
    const requiredFields: (keyof UserProfile)[] = [
      "firstName",
      "lastName",
      "email",
      "role",
    ];
    const newErrors: { [key: string]: string } = {};

    for (const field of requiredFields) {
      if (!profile[field]?.trim()) {
        newErrors[field] = `${field} is required`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const token = localStorage.getItem("token");
    await axios.put("/user/profile", profile, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUpdated(false);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <Box maxWidth="sm" mx="auto" mt={4} sx={{
        p: 4,
        boxShadow: "0 0 3px",
        borderRadius: 2,
    }}>
      <Typography variant="h5" mb={2}>
        Edit Profile
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
        <Box
          component="img"
          src={`https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}`}
          alt="Profile"
          sx={{ width: 80, height: 80, borderRadius: "50%", mb: 2 }}
        />
      </Box>
      <TextField
        fullWidth
        label="First Name"
        name="firstName"
        value={profile.firstName}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.firstName}
        helperText={errors.firstName}
      />
      <TextField
        fullWidth
        label="Last Name"
        name="lastName"
        value={profile.lastName}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.lastName}
        helperText={errors.lastName}
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        value={profile.email}
        onChange={handleChange}
        margin="normal"
        disabled
        required
        error={!!errors.email}
        helperText={errors.email}
      />
      <TextField
        fullWidth
        select
        label="Role"
        name="role"
        value={profile.role}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.role}
        helperText={errors.role}
      >
        {roles.map((role) => (
          <MenuItem key={role} value={role}>
            {role}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        label="Company"
        name="company"
        value={profile.company}
        onChange={handleChange}
        margin="normal"
      />
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={!updated}
        sx={{ mt: 2 }}
      >
        Save Changes
      </Button>
    </Box>
  );
};

export default Profile;
