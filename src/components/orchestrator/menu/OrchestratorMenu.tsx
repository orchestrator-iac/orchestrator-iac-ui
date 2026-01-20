import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { Node, Edge } from "@xyflow/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import DownloadIcon from "@mui/icons-material/Download";
import CodeIcon from "@mui/icons-material/Code";
import ArchiveIcon from "@mui/icons-material/Archive";
import { SaveButton } from "../save";
import { DeleteButton } from "../delete";
import { TemplateInfo } from "../../../types/orchestrator";
import { downloadFlowAsImage } from "../utils/downloadImage.ts";
import { orchestratorService } from "../../../services/orchestratorService";

interface OrchestratorMenuProps {
  nodes: Node[];
  edges: Edge[];
  templateInfo: TemplateInfo;
  currentOrchestratorId: string | null;
  onSaveSuccess: (orchestratorId: string) => void;
  orchestratorName?: string;
  isArchitectureMode: boolean;
  onArchitectureModeChange: (value: boolean) => void;
}

export const OrchestratorMenu: React.FC<OrchestratorMenuProps> = ({
  nodes,
  edges,
  templateInfo,
  currentOrchestratorId,
  onSaveSuccess,
  orchestratorName,
  isArchitectureMode,
  onArchitectureModeChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "none" | "generate" | "downloadZip"
  >("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });
  const open = Boolean(anchorEl);

  const canSave = nodes.length > 0;
  const canDelete = !!currentOrchestratorId;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleGenerateClick = () => {
    // Always save before generating IaC
    setPendingAction("generate");
    setSaveDialogOpen(true);
    handleMenuClose();
  };

  const handleDownloadZipClick = () => {
    // Save first, then request generation and download from returned URL
    setPendingAction("downloadZip");
    setSaveDialogOpen(true);
    handleMenuClose();
  };

  const handleDownloadImage = async () => {
    handleMenuClose();
    try {
      await downloadFlowAsImage({
        fileName: orchestratorName
          ? `${orchestratorName}.png`
          : "orchestrator.png",
        backgroundColor: "#ffffff",
      });
    } catch (error) {
      console.error("Failed to download orchestrator image", error);
    }
  };

  const triggerGenerate = useCallback(async (id: string) => {
    setIsGenerating(true);
    try {
      await orchestratorService.generateIac(id);
      setSnackbar({
        open: true,
        message: "IaC generation request submitted successfully.",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Failed to generate IaC:", error);
      setSnackbar({
        open: true,
        message: error?.message || "Failed to generate IaC",
        severity: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const triggerDownload = useCallback(async (id: string) => {
    setIsDownloading(true);
    try {
      const resp = await orchestratorService.generateIac(id);
      const url =
        resp?.downloadIaCUrl || resp?.downloadUrl || resp?.url || resp?.link;
      if (url) {
        try {
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          a.remove();
        } catch {
          if (!window.open(url, "_blank")) {
            globalThis.location.href = url;
          }
        }
        setSnackbar({
          open: true,
          message: "Your IaC zip is downloading.",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "No download URL returned from server.",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Failed to download IaC:", error);
      setSnackbar({
        open: true,
        message: error?.message || "Failed to download IaC",
        severity: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const handleSaveSuccessInternal = useCallback(
    async (savedId: string) => {
      if (!savedId) {
        console.error("handleSaveSuccessInternal received empty id", {
          savedId,
          pendingAction,
        });
        setSnackbar({
          open: true,
          message: "Save returned no ID",
          severity: "error",
        });
        return;
      }

      onSaveSuccess(savedId);

      const action = pendingAction;
      setPendingAction("none");
      if (action === "generate") {
        await triggerGenerate(savedId);
      } else if (action === "downloadZip") {
        await triggerDownload(savedId);
      }
    },
    [onSaveSuccess, pendingAction, triggerDownload, triggerGenerate],
  );

  // If the save dialog is closed without saving (cancel), clear pending action
  useEffect(() => {
    if (
      !saveDialogOpen &&
      pendingAction !== "none" &&
      !isGenerating &&
      !isDownloading
    ) {
      setPendingAction("none");
    }
  }, [saveDialogOpen, pendingAction, isGenerating, isDownloading]);

  return (
    <>
      <Tooltip title="Orchestrator Menu" arrow>
        <IconButton
          onClick={handleMenuClick}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "background.paper",
              transform: "translateY(-2px)",
              boxShadow: 2,
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: 2,
              boxShadow: 2,
              mt: 0.5,
            },
          },
        }}
      >
        <MenuItem
          disableRipple
          onClick={(event) => {
            event.stopPropagation();
          }}
          sx={{
            alignItems: "center",
            borderRadius: 1.5,
            mx: 0.5,
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <ListItemIcon>
            <ArchitectureIcon
              fontSize="small"
              color={isArchitectureMode ? "primary" : "inherit"}
            />
          </ListItemIcon>
          <ListItemText
            primary="Architecture mode"
            secondary={isArchitectureMode ? "Compact arch's" : "Detailed forms"}
            slotProps={{ primary: { sx: { fontWeight: 500 } } }}
            sx={{ cursor: "pointer", mr: 1 }}
            onClick={(event) => {
              event.stopPropagation();
              onArchitectureModeChange(!isArchitectureMode);
            }}
          />
          <Switch
            edge="end"
            size="small"
            checked={isArchitectureMode}
            onChange={(_, checked) => onArchitectureModeChange(checked)}
            onClick={(event) => {
              event.stopPropagation();
            }}
            slotProps={{ input: { "aria-label": "Toggle architecture mode" } }}
          />
        </MenuItem>

        <MenuItem
          onClick={handleDownloadImage}
          sx={{
            borderRadius: 1.5,
            mx: 0.5,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Download as Image</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleGenerateClick}
          disabled={!canSave || isGenerating}
          sx={{
            borderRadius: 1.5,
            mx: 0.5,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ListItemIcon>
            {isGenerating ? (
              <CircularProgress size={18} />
            ) : (
              <CodeIcon
                fontSize="small"
                color={canSave ? "primary" : "disabled"}
              />
            )}
          </ListItemIcon>
          <ListItemText>
            {isGenerating ? "Generating IaC…" : "Generate IaC"}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleDownloadZipClick}
          disabled={!canSave || isDownloading}
          sx={{
            borderRadius: 1.5,
            mx: 0.5,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ListItemIcon>
            {isDownloading ? (
              <CircularProgress size={18} />
            ) : (
              <ArchiveIcon
                fontSize="small"
                color={canSave ? "primary" : "disabled"}
              />
            )}
          </ListItemIcon>
          <ListItemText>
            {isDownloading ? "Preparing Zip…" : "Download IaC (zip)"}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleSaveClick}
          disabled={!canSave}
          sx={{
            borderRadius: 1.5,
            mx: 0.5,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ListItemIcon>
            <SaveIcon
              fontSize="small"
              color={canSave ? "primary" : "disabled"}
            />
          </ListItemIcon>
          <ListItemText>Save Orchestrator</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleDeleteClick}
          disabled={!canDelete}
          sx={{
            borderRadius: 1.5,
            mx: 0.5,
            color: canDelete ? "error.main" : "text.disabled",
            "&:hover": {
              bgcolor: canDelete ? "error.lighter" : "action.hover",
            },
          }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon
              fontSize="small"
              color={canDelete ? "error" : "disabled"}
            />
          </ListItemIcon>
          <ListItemText>Delete Orchestrator</ListItemText>
        </MenuItem>
      </Menu>

      {/* Hidden SaveButton - controlled by menu */}
      <Box sx={{ display: "none" }}>
        <SaveButton
          nodes={nodes}
          edges={edges}
          templateInfo={templateInfo}
          currentOrchestratorId={currentOrchestratorId}
          onSaveSuccess={handleSaveSuccessInternal}
          disabled={!canSave}
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
        />
      </Box>

      {/* Hidden DeleteButton - controlled by menu */}
      <Box sx={{ display: "none" }}>
        <DeleteButton
          currentOrchestratorId={currentOrchestratorId}
          orchestratorName={orchestratorName}
          disabled={!canDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      </Box>

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
