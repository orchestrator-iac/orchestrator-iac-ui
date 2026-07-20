import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Grid,
  Autocomplete,
  Typography,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import apiService from "../../../services/apiService";
import {
  CloudConfig,
  CloudProvider,
  cloudRegions,
} from "../../../types/clouds-info";

type TeamMember = {
  id?: string;
  email: string;
  role?: string;
};

type InitPopupProps = {
  open: boolean;
  templateInfo?: CloudConfig;
  setTemplateInfo: (info: CloudConfig) => void;
  onClose: () => void;
  onBackToHome?: () => void;
  onSubmit: (data: {
    templateName: string;
    cloud: string;
    region: string;
    team: TeamMember[];
  }) => void;
};

const InitPopup = ({
  open,
  templateInfo,
  setTemplateInfo,
  onClose,
  onBackToHome,
  onSubmit,
}: InitPopupProps) => {
  type InitFormState = {
    templateName: string;
    description: string;
    cloud: CloudProvider | "";
    region: string;
  };

  const [form, setForm] = useState<InitFormState>({
    templateName: templateInfo?.templateName || "",
    description: templateInfo?.description || "",
    cloud: templateInfo?.cloud || "",
    region: templateInfo?.region || "",
  });
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setTouched({
      templateName: false,
      description: false,
      cloud: false,
      region: false,
    });
    setForm({
      templateName: templateInfo?.templateName || "",
      description: templateInfo?.description || "",
      cloud: templateInfo?.cloud || "",
      region: templateInfo?.region || "",
    });
  }, [templateInfo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloudChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = e.target.value as CloudProvider | "";
    setForm((prev) => ({
      ...prev,
      cloud: value,
      region: "",
    }));
  };

  const handleInvite = async () => {
    try {
      const res: any = await apiService.post("/team/invite", { email });
      if (res.data?.user) {
        setTeam((prev: TeamMember[]) => [...prev, res.data.user as TeamMember]);
      }
      setEmail("");
    } catch (err) {
      console.error("Invite error", err);
    }
  };

  const handleSubmit = () => {
    if (!form.templateName || !form.cloud || !form.region) return;
    setTemplateInfo({
      templateName: form.templateName,
      description: form.description,
      cloud: form.cloud as CloudProvider,
      region: form.region,
    });
    onSubmit({ ...form, team });
    setTimeout(() => onClose(), 0);
  };

  const isFormValid = form.templateName && form.cloud && form.region;

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      fullWidth
      disableEnforceFocus
      disableAutoFocus
    >
      <DialogTitle>Initialize Template</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label="Template Name"
              name="templateName"
              value={form.templateName}
              onChange={handleChange}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, templateName: true }))
              }
              error={touched.templateName && !form.templateName}
              helperText={
                touched.templateName && !form.templateName
                  ? "Template Name is required"
                  : ""
              }
              fullWidth
              required
              sx={{
                mt: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              autoComplete="off"
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              autoComplete="off"
            />
          </Grid>

          <Grid size={6}>
            <TextField
              select
              label="Cloud"
              name="cloud"
              value={form.cloud}
              onChange={handleCloudChange}
              onBlur={() => setTouched((prev) => ({ ...prev, cloud: true }))}
              error={touched.cloud && !form.cloud}
              helperText={
                touched.cloud && !form.cloud ? "Cloud is required" : ""
              }
              fullWidth
              required
              SelectProps={{
                MenuProps: {
                  disablePortal: true,
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="aws">AWS</MenuItem>
              <MenuItem value="azure">Azure</MenuItem>
              <MenuItem value="gcp">GCP</MenuItem>
            </TextField>
          </Grid>

          <Grid size={6}>
            <Autocomplete
              options={form.cloud ? cloudRegions[form.cloud] : []}
              getOptionLabel={(option) =>
                option ? `${option.name} (${option.code})` : ""
              }
              isOptionEqualToValue={(option, value) => option.code === value.code}
              value={
                form.cloud
                  ? cloudRegions[form.cloud].find(
                      (r) => r.code === form.region,
                    ) || null
                  : null
              }
              onChange={(_, newValue) =>
                setForm((prev) => ({
                  ...prev,
                  region: newValue ? newValue.code : "",
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Region"
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, region: true }))
                  }
                  error={touched.region && !form.region}
                  helperText={
                    touched.region && !form.region ? "Region is required" : ""
                  }
                  fullWidth
                  required
                  autoComplete="off"
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.code}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <span>{option.name}</span>
                    <Typography
                      component="code"
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {option.code}
                    </Typography>
                  </Box>
                </li>
              )}
              disabled={!form.cloud}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="Invite by Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              onClick={handleInvite}
              variant="contained"
              sx={{
                mt: 1,
                borderRadius: 2,
                textTransform: "none",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              Invite
            </Button>

            <List>
              {team.map((member) => (
                <ListItem key={member.id || member.email}>
                  <ListItemText
                    primary={member.email}
                    secondary={member.role || "Member"}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          justifyContent: onBackToHome ? "space-between" : "flex-end",
        }}
      >
        {onBackToHome ? (
          <Button
            onClick={onBackToHome}
            sx={{
              borderRadius: 2,
              px: 2,
              textTransform: "none",
            }}
          >
            Back to Home
          </Button>
        ) : null}
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
          disabled={!isFormValid}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InitPopup;
