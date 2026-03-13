import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Divider,
  useTheme,
  alpha,
  IconButton,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { templateService } from "../../../services/templateService";
import { TemplateDetail } from "../../../types/template";
import RichNoteEditor from "../../notes/RichNoteEditor";

interface PublishTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  orchestratorId: string;
  /** Pre-filled orchestrator name for the template name field */
  orchestratorName?: string;
  /** If already published, pass the existing template for update/un-publish mode */
  existingTemplate?: TemplateDetail | null;
  onSuccess?: (templateId?: string) => void;
}

const README_PLACEHOLDER_HTML =
  "<h2>Overview</h2><p>Describe what this infrastructure template does and what problem it solves.</p>" +
  "<h2>Architecture</h2><p>List the main components and how they connect.</p>" +
  "<h2>Usage</h2><p>Steps to configure after forking:</p><ol><li><p></p></li><li><p></p></li></ol>" +
  "<h2>Prerequisites</h2><ul><li><p></p></li></ul>";

const PublishTemplateDialog: React.FC<PublishTemplateDialogProps> = ({
  open,
  onClose,
  orchestratorId,
  orchestratorName,
  existingTemplate,
  onSuccess,
}) => {
  const theme = useTheme();
  const isUpdate = !!existingTemplate;

  const [templateName, setTemplateName] = useState(
    existingTemplate?.templateName || orchestratorName || "",
  );
  const [description, setDescription] = useState(
    existingTemplate?.description || "",
  );
  const [readme, setReadme] = useState(
    existingTemplate?.readme || README_PLACEHOLDER_HTML,
  );
  const [loading, setLoading] = useState(false);
  const [unpublishLoading, setUnpublishLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  // Reset when dialog opens fresh
  useEffect(() => {
    if (open) {
      setTemplateName(existingTemplate?.templateName || orchestratorName || "");
      setDescription(existingTemplate?.description || "");
      setReadme(existingTemplate?.readme || README_PLACEHOLDER_HTML);
      setError(null);
      setSuccess(null);
      setConfirmUnpublish(false);
    }
  }, [open, existingTemplate, orchestratorName]);

  const handlePublish = async () => {
    setError(null);
    if (!templateName.trim()) {
      setError("Template name is required.");
      return;
    }
    setLoading(true);
    try {
      if (isUpdate && existingTemplate) {
        await templateService.updateTemplate(existingTemplate.id, {
          templateName: templateName.trim(),
          description: description.trim() || undefined,
          readme: readme.trim() || undefined,
        });
        setSuccess("Template updated!");
        onSuccess?.(existingTemplate.id);
      } else {
        const res = await templateService.publishTemplate({
          orchestratorId,
          readme: readme.trim(),
          templateName: templateName.trim() || undefined,
          description: description.trim() || undefined,
        });
        setSuccess("Published to Templates gallery!");
        onSuccess?.(res.id);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!existingTemplate) return;
    setUnpublishLoading(true);
    setError(null);
    try {
      await templateService.deleteTemplate(existingTemplate.id);
      setSuccess("Template removed from gallery.");
      onSuccess?.(undefined);
    } catch {
      setError("Failed to un-publish. Please try again.");
    } finally {
      setUnpublishLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.main,
              fontSize: "0.9rem",
            }}
          >
            <FontAwesomeIcon icon="layer-group" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {isUpdate ? "Manage Template" : "Publish as Template"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {isUpdate
                ? "Update your published template or remove it from the gallery"
                : "Share this orchestrator as a public template for others to fork"}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <FontAwesomeIcon icon="xmark" style={{ fontSize: "0.9rem" }} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            fullWidth
            size="small"
            required
            placeholder="e.g. AWS VPC with EKS and RDS"
            helperText="A clear, descriptive name for your template"
          />

          <TextField
            label="Short Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
            placeholder="Briefly describe what this template sets up..."
            helperText="Shown on the template card in the gallery (optional)"
          />

          {/* Readme rich editor */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}>
              README
            </Typography>
            <RichNoteEditor
              value={readme}
              onChange={setReadme}
              minHeight={280}
              placeholder="Describe your template — what it does, architecture, usage steps..."
              advanced
            />
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Box>
          {isUpdate && (
            confirmUnpublish ? (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: "error.main", fontWeight: 600, whiteSpace: "nowrap" }}>
                  Remove from gallery?
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleUnpublish}
                  disabled={unpublishLoading}
                  startIcon={
                    unpublishLoading
                      ? <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "0.75rem" }} />
                      : <FontAwesomeIcon icon="trash" style={{ fontSize: "0.75rem" }} />
                  }
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  {unpublishLoading ? "Removing..." : "Yes, Unpublish"}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setConfirmUnpublish(false)}
                  sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setConfirmUnpublish(true)}
                disabled={loading}
                startIcon={<FontAwesomeIcon icon="eye-slash" style={{ fontSize: "0.75rem" }} />}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Unpublish
              </Button>
            )
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading || unpublishLoading}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePublish}
            disabled={loading || unpublishLoading || !!success}
            startIcon={
              loading
                ? <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "0.75rem" }} />
                : <FontAwesomeIcon icon={isUpdate ? "floppy-disk" : "layer-group"} style={{ fontSize: "0.75rem" }} />
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {loading
              ? isUpdate ? "Saving..." : "Publishing..."
              : isUpdate ? "Save Changes" : "Publish Template"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PublishTemplateDialog;
