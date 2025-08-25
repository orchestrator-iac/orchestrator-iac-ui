// pages/Profile.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  useTheme,
  Fade,
  Grid,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import { useAuth } from "../../../context/AuthContext";
import { uploadProfileImage } from "../../../services/auth";
import { UserProfile } from "../../../types/auth";
import apiService from "../../../services/apiService";

const roles = [
  "Developer",
  "DevOps Engineer",
  "Cloud Architect",
  "Product Manager",
  "Other",
];

const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const theme = useTheme();
  const themeOptions = [
    { label: "System Default", value: "system" },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [updated, setUpdated] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  useEffect(() => {
    if (user) {
      setProfile({
        _id: user._id ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        role: user.role ?? "",
        company: user.company ?? "",
        imageUrl: user.imageUrl ?? "",
        themePreference: user.themePreference ?? "system"
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
    await apiService.put("/user/profile", profile, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await refreshProfile();
    setUpdated(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = {
      imageBase64: await convertToBase64(file),
    };

    const res = await uploadProfileImage(formData);

    const imageUrl = res.data.imageUrl;

    setProfile((prev) => (prev ? { ...prev, imageUrl } : null));
    setUpdated(true);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(new Error(`File reading failed: ${JSON.stringify(error)}`));
    });
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <Box maxWidth="md" mx="auto" mt={4} mb={4}>
      <Typography variant="h5" mb={2}>
        Edit Profile
      </Typography>
      <Box display="flex" justifyContent="center" mb={2}>
        <Box
          position="relative"
          width={200}
          height={200}
          sx={{
            borderRadius: "50%",
            boxShadow: "0 0 5px",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Profile Image */}
          <Box
            component="img"
            src={
              profile.imageUrl
                ? profile.imageUrl
                : `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}`
            }
            alt="Profile"
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
              pointer: "cursor",
            }}
            onClick={() => fileInputRef.current?.click()}
          />

          <Fade in={hovered}>
            <Box
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                borderRadius: "50%",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                cursor: "pointer",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <IconButton sx={{ color: "white", pointer: "cursor" }}>
                <PhotoCameraIcon />
              </IconButton>
            </Box>
          </Fade>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            hidden
            onChange={handleFileChange}
          />
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
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
        </Grid>
        <Grid item xs={12} sm={6}>
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
        </Grid>
        <Grid item xs={12} sm={6}>
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
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Theme Preference"
            name="themePreference"
            value={profile.themePreference || "system"}
            onChange={handleChange}
            margin="normal"
          >
            {themeOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
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
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Company"
            name="company"
            value={profile.company}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={!updated}
        sx={{ mt: 2, mb: 4 }}
      >
        Save Changes
      </Button>
    </Box>
  );
};

export default Profile;
