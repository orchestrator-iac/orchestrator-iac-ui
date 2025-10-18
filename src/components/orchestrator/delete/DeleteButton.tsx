import React, { useCallback, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { deleteOrchestrator } from "../../../store/orchestratorsSlice";

interface DeleteButtonProps {
  currentOrchestratorId: string | null;
  orchestratorName?: string;
  disabled?: boolean;
}

/**
 * Button component that handles orchestrator deletion with confirmation
 * Requires an existing orchestrator ID to be enabled
 */
export const DeleteButton: React.FC<DeleteButtonProps> = ({
  currentOrchestratorId,
  orchestratorName,
  disabled = false,
}) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmClose = useCallback(() => {
    setConfirmDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!currentOrchestratorId) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteOrchestrator(currentOrchestratorId)).unwrap();
      setConfirmDialogOpen(false);
      // Navigate to home or orchestrator list after successful deletion
      navigate("/orchestrator");
    } catch (error) {
      console.error("Failed to delete orchestrator:", error);
      // Optionally show error toast/snackbar here
      setIsDeleting(false);
    }
  }, [currentOrchestratorId, dispatch, navigate]);

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        size="small"
        startIcon={<DeleteIcon />}
        onClick={handleClick}
        disabled={disabled || !currentOrchestratorId || isDeleting}
        sx={{ ml: 2 }}
        title={
          currentOrchestratorId
            ? "Delete orchestrator configuration"
            : "Save orchestrator first to enable delete"
        }
      >
        Delete
      </Button>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete {orchestratorName ? `"${orchestratorName}"` : "this orchestrator"}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
