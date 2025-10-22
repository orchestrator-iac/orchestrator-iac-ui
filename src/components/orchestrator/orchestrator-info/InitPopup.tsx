import {
  Dialog,
  DialogTitle,
  DialogContent,
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
import { CloudConfig, CloudProvider, cloudRegions } from "../../../types/clouds-info";

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
  onSubmit,
}: InitPopupProps) => {
  const [form, setForm] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "cloud" ? { region: "" } : {}),
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
            />
          </Grid>

          <Grid size={6}>
            <TextField
              select
              label="Cloud"
              name="cloud"
              value={form.cloud}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, cloud: true }))}
              error={touched.cloud && !form.cloud}
              helperText={
                touched.cloud && !form.cloud ? "Cloud is required" : ""
              }
              fullWidth
              required
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
              value={
                form.cloud
                  ? cloudRegions[form.cloud].find(
                      (r) => r.code === form.region
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
            />
            <Button onClick={handleInvite} variant="contained" sx={{ mt: 1 }}>
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

          <Grid size={12}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ mt: 2 }}
              disabled={!isFormValid}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default InitPopup;
