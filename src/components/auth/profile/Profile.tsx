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
  Alert,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import { useAuth } from "../../../context/AuthContext";
import { uploadProfileImage } from "../../../services/auth";
import { UserProfile } from "../../../types/auth";
import apiService from "../../../services/apiService";
import LumaSpin from "../../ui/luma-spin";
import styles from "./Profile.module.css";

const jobFunctions = [
  "Developer",
  "DevOps Engineer",
  "Cloud Architect",
  "Product Manager",
  "Other",
];

const Profile: React.FC = () => {
  const { user, token, isInitializing, refreshProfile } = useAuth();
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
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const refreshAttemptedRef = useRef(false);

  useEffect(() => {
    document.body.dataset.theme = theme.palette.mode;
  }, [theme.palette.mode]);

  useEffect(() => {
    if (user) {
      setProfile({
        _id: user._id ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        job_role: user.job_role ?? "",
        company: user.company ?? "",
        imageUrl: user.imageUrl ?? "",
        themePreference: user.themePreference ?? "system",
      });
    }
  }, [user]);

  useEffect(() => {
    if (isInitializing || !token || user || refreshAttemptedRef.current) {
      return;
    }

    refreshAttemptedRef.current = true;
    void refreshProfile();
  }, [isInitializing, refreshProfile, token, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!profile) return;

    setProfile({ ...profile, [name]: value });
    setUpdated(true);
    setFeedback("");

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
    const requiredFields: Array<"firstName" | "lastName" | "email"> = [
      "firstName",
      "lastName",
      "email",
    ];
    const newErrors: { [key: string]: string } = {};

    for (const field of requiredFields) {
      const value = profile[field];
      if (typeof value !== "string" || !value.trim()) {
        newErrors[field] = `${field} is required`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setFeedback("");
    try {
      const token = localStorage.getItem("token");
      await apiService.put("/user/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshProfile();
      setUpdated(false);
      setFeedback("Profile saved");
    } catch {
      setFeedback("We couldn't save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFeedback("");
    try {
      const formData = {
        imageBase64: await convertToBase64(file),
      };
      const res = await uploadProfileImage(formData);
      const imageUrl = res.data.imageUrl;

      setProfile((prev) => (prev ? { ...prev, imageUrl } : null));
      setUpdated(true);
      setFeedback("Photo ready to save");
    } catch {
      setFeedback("We couldn't upload that photo. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) =>
        reject(new Error(`File reading failed: ${JSON.stringify(error)}`));
    });
  };

  if (!profile) {
    return (
      <Box
        className={styles.page}
        aria-busy={isInitializing || Boolean(token)}
        aria-live="polite"
      >
        <Box className={styles.container}>
          <Box className={styles.loadingState}>
            <LumaSpin size={44} />
            <Typography component="h1" className={styles.loadingTitle}>
              Preparing your profile
            </Typography>
            <Typography component="p" className={styles.loadingCopy}>
              Loading your account details and workspace preferences…
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() ||
    "U";

  return (
    <Box component="main" className={styles.page}>
      <Box className={styles.container}>
        <Box component="header" className={styles.pageHeader}>
          <Box>
            <Typography component="h1" className={styles.title}>
              Your profile
            </Typography>
            <Typography component="p" className={styles.subtitle}>
              Keep your account details and workspace preferences in step with
              the way you work.
            </Typography>
          </Box>
          <Box className={styles.pageHeaderMark} aria-hidden="true" />
        </Box>

        <Box className={styles.profileLayout}>
          <Box component="section" className={styles.identityPanel}>
            <Typography component="h2" className={styles.sectionTitle}>
              Identity
            </Typography>
            <Typography component="p" className={styles.sectionCopy}>
              Add a photo and a few details so your workspace feels like yours.
            </Typography>

            <Box
              className={styles.avatarFrame}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {profile.imageUrl ? (
                <Box
                  component="img"
                  src={profile.imageUrl}
                  alt={
                    `${profile.firstName} ${profile.lastName}`.trim() ||
                    "Profile"
                  }
                  className={styles.avatarImage}
                />
              ) : (
                <Typography component="span" className={styles.avatarFallback}>
                  {initials}
                </Typography>
              )}

              <Fade in={hovered || isUploading}>
                <Box
                  className={styles.avatarOverlay}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconButton
                    className={styles.photoButton}
                    aria-label={
                      isUploading
                        ? "Uploading profile photo"
                        : "Change profile photo"
                    }
                    disabled={isUploading}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
              </Fade>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                hidden
                aria-label="Upload profile photo"
                onChange={handleFileChange}
              />
            </Box>

            <Typography component="h3" className={styles.identityName}>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography component="p" className={styles.identityEmail}>
              {profile.email}
            </Typography>
            <Button
              variant="outlined"
              className={styles.uploadButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading…" : "Change photo"}
            </Button>
          </Box>

          <Box
            component="form"
            className={styles.formPanel}
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
          >
            <Box className={styles.formHeader}>
              <Box>
                <Typography component="h2" className={styles.sectionTitle}>
                  Account details
                </Typography>
                <Typography component="p" className={styles.sectionCopy}>
                  Your email is used for sign-in and cannot be changed here.
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  className={styles.field}
                  label="First Name"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  required
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  className={styles.field}
                  label="Last Name"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  required
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  className={styles.field}
                  label="Email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  className={styles.field}
                  label="Theme Preference"
                  name="themePreference"
                  value={profile.themePreference || "system"}
                  onChange={handleChange}
                >
                  {themeOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  className={styles.field}
                  label="Job Role"
                  name="job_role"
                  value={profile.job_role ?? ""}
                  onChange={handleChange}
                >
                  {jobFunctions.map((jf) => (
                    <MenuItem key={jf} value={jf}>
                      {jf}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  className={styles.field}
                  label="Company"
                  name="company"
                  value={profile.company}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {feedback && (
              <Alert
                severity={feedback.includes("couldn't") ? "error" : "success"}
                className={styles.feedback}
                sx={{ mt: 3 }}
              >
                {feedback}
              </Alert>
            )}

            <Box className={styles.actions}>
              <Typography component="p" className={styles.feedback}>
                {updated ? "Unsaved changes" : "Your profile is up to date"}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                className={styles.saveButton}
                disabled={!updated || isSaving}
              >
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
