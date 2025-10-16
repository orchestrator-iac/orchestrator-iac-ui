import React, { useState, useCallback } from "react";
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
  const [orchestratorName, setOrchestratorName] = useState("");
  const [orchestratorDescription, setOrchestratorDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      setSaveError(null);
      onClose();
    }
  }, [isSaving, onClose]);

  const handleSave = useCallback(async () => {
    if (!orchestratorName.trim()) {
      setSaveError("Please provide a name for this orchestrator");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const orchestratorData = prepareOrchestratorForSave(
        nodes,
        edges,
        templateInfo,
        orchestratorName.trim(),
        orchestratorDescription.trim() || undefined
      );

      let response;
      if (currentOrchestratorId) {
        // Update existing
        response = await orchestratorService.updateOrchestrator(
          currentOrchestratorId,
          orchestratorData
        );
      } else {
        // Create new
        response = await orchestratorService.saveOrchestrator(orchestratorData);
      }

      // Notify parent of successful save
      onSaveSuccess(response._id);

      // Show success message
      setShowSuccess(true);

      // Close dialog after short delay
      setTimeout(() => {
        setOrchestratorName("");
        setOrchestratorDescription("");
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
    orchestratorName,
    orchestratorDescription,
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
              label="Name"
              required
              fullWidth
              value={orchestratorName}
              onChange={(e) => setOrchestratorName(e.target.value)}
              placeholder="e.g., Production VPC Setup"
              autoFocus
              disabled={isSaving}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={orchestratorDescription}
              onChange={(e) => setOrchestratorDescription(e.target.value)}
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
            disabled={isSaving || !orchestratorName.trim()}
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
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
