import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Snackbar,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { Node, Edge } from "@xyflow/react";

import { orchestratorService } from "../../../services/orchestratorService";
import { prepareOrchestratorForSave } from "../../../utils/orchestratorUtils";
import { TemplateInfo } from "../../../types/orchestrator";
import { generateFlowImage } from "../utils/downloadImage";
import { useAuth } from "../../../context/AuthContext";

interface SaveOrchestratorDialogProps {
  open: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  templateInfo: TemplateInfo;
  currentOrchestratorId: string | null;
  onSaveSuccess: (orchestratorId: string) => void;
}

/**
 * Dialog component for saving/updating orchestrator configurations
 * Handles validation, API calls, and user feedback
 */
export const SaveOrchestratorDialog: React.FC<SaveOrchestratorDialogProps> = ({
  open,
  onClose,
  nodes,
  edges,
  templateInfo,
  currentOrchestratorId,
  onSaveSuccess,
}) => {
  const { user } = useAuth();
  const [templateName, setTemplateName] = useState(
    templateInfo?.templateName || "",
  );
  const [templateDescription, setTemplateDescription] = useState(
    templateInfo?.description || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Update state when dialog opens or templateInfo changes
  useEffect(() => {
    if (open) {
      setTemplateName(templateInfo?.templateName || "");
      setTemplateDescription(templateInfo?.description || "");
      setSaveError(null);
    }
  }, [open, templateInfo?.templateName, templateInfo?.description]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      setSaveError(null);
      onClose();
    }
  }, [isSaving, onClose]);

  const handleSave = useCallback(async () => {
    if (!templateName.trim()) {
      setSaveError("Please provide a name for this orchestrator");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Step 1: Generate the orchestrator image
      let imageDataUrl: string | undefined;
      try {
        console.log("Generating orchestrator preview image...");
        imageDataUrl = await generateFlowImage({
          backgroundColor: "#ffffff",
          quality: 0.85,
          pixelRatio: 1.5,
        });
        console.log("Image generated successfully");
      } catch (imageError) {
        console.warn("Failed to generate preview image:", imageError);
        // Continue with save even if image generation fails
      }

      // Step 2: Prepare orchestrator data with updated templateInfo
      const updatedTemplateInfo: TemplateInfo = {
        ...templateInfo,
        templateName: templateName.trim(),
        description: templateDescription.trim() || undefined,
      };

      const orchestratorData = prepareOrchestratorForSave(
        nodes,
        edges,
        updatedTemplateInfo,
        user,
      );

      // Step 3: Add the image to the request if generated successfully
      let dataWithImage = orchestratorData;
      if (imageDataUrl) {
        // Extract base64 data without the data URL prefix
        // Format: "data:image/png;base64,iVBORw0KGgo..." -> "iVBORw0KGgo..."
        const base64Data = imageDataUrl.includes(",")
          ? imageDataUrl.split(",")[1]
          : imageDataUrl;

        dataWithImage = {
          ...orchestratorData,
          previewImage: base64Data,
        };
      }

      // Step 4: Save to backend
      let response;
      if (currentOrchestratorId) {
        // Update existing
        response = await orchestratorService.updateOrchestrator(
          currentOrchestratorId,
          dataWithImage,
        );
      } else {
        // Create new
        response = await orchestratorService.saveOrchestrator(dataWithImage);
      }

      // Determine saved id (support either _id or id from backend)
      const savedId: string | undefined =
        (response as any)?._id || (response as any)?.id;
      if (!savedId) {
        console.error(
          "Save succeeded but no id was returned in response",
          response,
        );
        throw new Error("Backend did not return an orchestrator id");
      }

      // Notify parent of successful save
      onSaveSuccess(savedId);

      // Show success message
      setShowSuccess(true);

      // Close dialog after short delay
      setTimeout(() => {
        setTemplateName("");
        setTemplateDescription("");
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to save orchestrator:", error);
      setSaveError(error.message || "Failed to save orchestrator");
    } finally {
      setIsSaving(false);
    }
  }, [
    nodes,
    edges,
    templateInfo,
    templateName,
    templateDescription,
    currentOrchestratorId,
    onSaveSuccess,
    handleClose,
  ]);

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Save Orchestrator Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Template Name"
              required
              fullWidth
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Production VPC Setup"
              autoFocus
              disabled={isSaving}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Optional description of this configuration"
              disabled={isSaving}
            />
            {saveError && (
              <Alert severity="error" onClose={() => setSaveError(null)}>
                {saveError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={isSaving || !templateName.trim()}
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ marginRight: 2 }}
          >
            {isSaving ? "Saving..." : currentOrchestratorId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Orchestrator saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
};
