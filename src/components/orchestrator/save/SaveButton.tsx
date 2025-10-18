import { useCallback, useState, useEffect } from "react";
import { Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { Node, Edge } from "@xyflow/react";

import { validateOrchestratorData } from "../../../utils/orchestratorUtils";
import { SaveOrchestratorDialog } from "./SaveOrchestratorDialog";
import { TemplateInfo } from "../../../types/orchestrator";

interface SaveButtonProps {
  nodes: Node[];
  edges: Edge[];
  templateInfo: TemplateInfo;
  currentOrchestratorId: string | null;
  onSaveSuccess: (orchestratorId: string) => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Button component that triggers the save orchestrator dialog
 * Validates data before opening the dialog
 */
export const SaveButton: React.FC<SaveButtonProps> = ({
  nodes,
  edges,
  templateInfo,
  currentOrchestratorId,
  onSaveSuccess,
  disabled = false,
  open: externalOpen,
  onOpenChange,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync external open state with internal state
  useEffect(() => {
    if (externalOpen !== undefined && externalOpen !== dialogOpen) {
      handleClick();
    }
  }, [externalOpen]);

  const handleClick = useCallback(() => {
    // Validate before opening dialog
    const validation = validateOrchestratorData(nodes, edges);
    if (!validation.valid) {
      setValidationError(validation.errors.join(", "));
      console.error("Validation errors:", validation.errors);
      onOpenChange?.(false);
      return;
    }
    setValidationError(null);
    setDialogOpen(true);
    onOpenChange?.(true);
  }, [nodes, edges, onOpenChange]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const handleSaveSuccess = useCallback(
    (orchestratorId: string) => {
      onSaveSuccess(orchestratorId);
      setDialogOpen(false);
    },
    [onSaveSuccess]
  );

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<SaveIcon />}
        onClick={handleClick}
        disabled={disabled || nodes.length === 0}
        sx={{ ml: 2 }}
        title={
          nodes.length === 0
            ? "Add nodes to enable save"
            : validationError || "Save orchestrator configuration"
        }
      >
        Save
      </Button>

      <SaveOrchestratorDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        nodes={nodes}
        edges={edges}
        templateInfo={templateInfo}
        currentOrchestratorId={currentOrchestratorId}
        onSaveSuccess={handleSaveSuccess}
      />
    </>
  );
};

SaveButton.displayName = 'SaveButton';
