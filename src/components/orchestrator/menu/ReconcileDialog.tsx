import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import {
  orchestratorService,
  ReconciliationError,
} from "../../../services/orchestratorService";
import { SaveOrchestratorResponse } from "../../../types/orchestrator";

interface ReconcileDialogProps {
  open: boolean;
  onClose: () => void;
  orchestratorId: string | null;
  onReconciled: (response: SaveOrchestratorResponse) => void;
}

/**
 * Tier 1 drift reconciliation: the user manually uploads a Terraform
 * `.tfstate` JSON file for the currently saved orchestrator. No credentials,
 * no persistent connection — the file is sent once, compared, and discarded
 * server-side; only the computed result is kept.
 */
export const ReconcileDialog: React.FC<ReconcileDialogProps> = ({
  open,
  onClose,
  orchestratorId,
  onReconciled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (isUploading) {
      return;
    }
    setSelectedFile(null);
    setError(null);
    onClose();
  }, [isUploading, onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = useCallback(async () => {
    if (!orchestratorId || !selectedFile) {
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const response = await orchestratorService.reconcileState(
        orchestratorId,
        selectedFile,
      );
      onReconciled(response);
      setSelectedFile(null);
      onClose();
    } catch (err: any) {
      console.error("Failed to reconcile Terraform state:", err);
      setError(
        err instanceof ReconciliationError
          ? err.message
          : "Failed to reconcile Terraform state",
      );
    } finally {
      setIsUploading(false);
    }
  }, [orchestratorId, selectedFile, onReconciled, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reconcile against Terraform state</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Upload a Terraform <code>.tfstate</code> file to see how this
          orchestrator's design compares with what's actually deployed. This
          is a one-time, credential-free check — the file is never stored;
          only the comparison result is kept.
        </Alert>

        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".tfstate,.json,application/json"
            hidden
            onChange={handleFileChange}
          />
          {selectedFile ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <DescriptionOutlinedIcon color="primary" />
              <Typography variant="body2">{selectedFile.name}</Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No file selected
            </Typography>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadFileIcon />}
            sx={{ mt: 2 }}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? "Choose a different file" : "Choose .tfstate file"}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || isUploading}
          startIcon={
            isUploading ? <CircularProgress size={18} /> : <UploadFileIcon />
          }
        >
          {isUploading ? "Reconciling…" : "Reconcile"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReconcileDialog;
