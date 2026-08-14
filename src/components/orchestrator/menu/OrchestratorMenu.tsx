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
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
} from "@mui/material";
import { Node, Edge } from "@xyflow/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import DownloadIcon from "@mui/icons-material/Download";
import ArchiveIcon from "@mui/icons-material/Archive";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PolicyIcon from "@mui/icons-material/GppMaybe";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { SaveButton } from "../save";
import { DeleteButton } from "../delete";
import {
  IaCValidationIssue,
  PolicyScanSettings,
  ReconciliationResult,
  SaveOrchestratorResponse,
  TemplateInfo,
} from "../../../types/orchestrator";
import { downloadFlowAsImage } from "../utils/downloadImage.ts";
import {
  IacValidationError,
  orchestratorService,
} from "../../../services/orchestratorService";
import PublishTemplateDialog from "../publish-template/PublishTemplateDialog";
import PolicyFindingsDialog from "./PolicyFindingsDialog";
import PolicyScanSettingsDialog from "./PolicyScanSettingsDialog";
import ReconcileDialog from "./ReconcileDialog";
import DriftReportDialog from "./DriftReportDialog";

interface MenuToggleItemProps {
  icon: React.ComponentType<{
    fontSize?: "small";
    color?: "primary" | "disabled";
  }>;
  active: boolean;
  primary: string;
  secondary: string;
  ariaLabel: string;
  onToggle: (checked: boolean) => void;
  extraAction?: React.ReactNode;
}

/** A menu row pairing an icon/label with a toggle switch (Architecture mode, Auto-save, Policy scan). */
const MenuToggleItem: React.FC<MenuToggleItemProps> = ({
  icon: Icon,
  active,
  primary,
  secondary,
  ariaLabel,
  onToggle,
  extraAction,
}) => (
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
      <Icon fontSize="small" color={active ? "primary" : "disabled"} />
    </ListItemIcon>
    <ListItemText
      primary={primary}
      secondary={secondary}
      slotProps={{ primary: { sx: { fontWeight: 500 } } }}
      sx={{ cursor: "pointer", mr: 1 }}
      onClick={(event) => {
        event.stopPropagation();
        onToggle(!active);
      }}
    />
    {extraAction}
    <Switch
      edge="end"
      size="small"
      checked={active}
      onChange={(_, checked) => onToggle(checked)}
      onClick={(event) => {
        event.stopPropagation();
      }}
      slotProps={{ input: { "aria-label": ariaLabel } }}
    />
  </MenuItem>
);

/** Resolves the color/hover styling for a standard vs. destructive menu action item. */
const getActionItemStyles = (destructive: boolean, disabled: boolean) => {
  if (!destructive) {
    return { color: undefined, hoverBg: "action.hover" };
  }
  return {
    color: disabled ? "text.disabled" : "error.main",
    hoverBg: disabled ? "action.hover" : "error.lighter",
  };
};

interface MenuActionItemProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: React.ReactNode;
  destructive?: boolean;
}

/** A single-icon, single-label menu action row (Save, Reconcile, Delete, etc.). */
const MenuActionItem: React.FC<MenuActionItemProps> = ({
  onClick,
  disabled = false,
  icon,
  label,
  destructive = false,
}) => {
  const { color, hoverBg } = getActionItemStyles(destructive, disabled);
  return (
    <MenuItem
      onClick={onClick}
      disabled={disabled}
      sx={{
        borderRadius: 1.5,
        mx: 0.5,
        color,
        "&:hover": { bgcolor: hoverBg },
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  );
};

interface PublishMenuItemProps {
  canPublish: boolean;
  isUpdate: boolean;
  activeColor: string;
  disabledColor: string;
  onClick: () => void;
}

/** "Publish as Template" / "Manage Template" menu row. */
const PublishMenuItem: React.FC<PublishMenuItemProps> = ({
  canPublish,
  isUpdate,
  activeColor,
  disabledColor,
  onClick,
}) => (
  <MenuItem
    onClick={onClick}
    disabled={!canPublish}
    sx={{
      borderRadius: 1.5,
      mx: 0.5,
      "&:hover": { bgcolor: "action.hover" },
    }}
  >
    <ListItemIcon>
      <FontAwesomeIcon
        icon={isUpdate ? "pen" : "layer-group"}
        style={{
          fontSize: 16,
          color: canPublish ? activeColor : disabledColor,
        }}
      />
    </ListItemIcon>
    <ListItemText>
      {isUpdate ? "Manage Template" : "Publish as Template"}
    </ListItemText>
  </MenuItem>
);

interface DownloadZipMenuItemProps {
  canSave: boolean;
  isDownloading: boolean;
  onClick: () => void;
}

/** "Download IaC (zip)" menu row, swapping to a spinner while a download is in flight. */
const DownloadZipMenuItem: React.FC<DownloadZipMenuItemProps> = ({
  canSave,
  isDownloading,
  onClick,
}) => (
  <MenuItem
    onClick={onClick}
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
        <ArchiveIcon fontSize="small" color={canSave ? "primary" : "disabled"} />
      )}
    </ListItemIcon>
    <ListItemText>
      {isDownloading ? "Preparing Zip…" : "Download IaC (zip)"}
    </ListItemText>
  </MenuItem>
);

/** Triggers a browser download/open of `url`, falling back if the anchor-click approach is blocked. */
const openDownloadLink = (url: string): void => {
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
};

/** Picks the success vs. "generated with warnings" snackbar copy for generate/download actions. */
const buildGenerateSnackbar = (
  hasIssues: boolean,
  successMessage: string,
  warningMessage: string,
): { message: string; severity: "success" | "info" } =>
  hasIssues
    ? { message: warningMessage, severity: "info" }
    : { message: successMessage, severity: "success" };

interface OrchestratorMenuProps {
  nodes: Node[];
  edges: Edge[];
  templateInfo: TemplateInfo;
  currentOrchestratorId: string | null;
  onSaveSuccess: (orchestratorId: string) => void;
  orchestratorName?: string;
  isArchitectureMode: boolean;
  onArchitectureModeChange: (value: boolean) => void;
  autoSaveEnabled: boolean;
  onAutoSaveEnabledChange: (value: boolean) => void;
  policyScan: PolicyScanSettings;
  onPolicyScanChange: (value: PolicyScanSettings) => void;
  onValidationIssuesChange?: (issues: IaCValidationIssue[]) => void;
  /** templateId set on the orchestrator if it has been published to the gallery */
  templateId?: string;
  onReconciliationChange?: (result: ReconciliationResult | null) => void;
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
  autoSaveEnabled,
  onAutoSaveEnabledChange,
  policyScan,
  onPolicyScanChange,
  onValidationIssuesChange,
  templateId,
  onReconciliationChange,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "none" | "generate" | "downloadZip"
  >("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationIssues, setValidationIssues] = useState<IaCValidationIssue[]>(
    [],
  );
  const [validationAction, setValidationAction] = useState<
    "generate" | "downloadZip"
  >("generate");
  const [validationOrchestratorId, setValidationOrchestratorId] = useState<
    string | null
  >(null);
  const [policyFindingsDialogOpen, setPolicyFindingsDialogOpen] =
    useState(false);
  const [policyFindings, setPolicyFindings] = useState<IaCValidationIssue[]>(
    [],
  );
  const [policyScanSettingsOpen, setPolicyScanSettingsOpen] = useState(false);
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false);
  const [driftReportOpen, setDriftReportOpen] = useState(false);
  const [driftResult, setDriftResult] = useState<ReconciliationResult | null>(
    null,
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });
  const open = Boolean(anchorEl);

  const canSave = nodes.length > 0;
  const canDelete = !!currentOrchestratorId;
  // Publishing requires at least one resource - a zero-node orchestrator can
  // exist now (created immediately on Initialize Template), but shouldn't be
  // publishable as an empty template.
  const canPublish = canDelete && nodes.length > 0;

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

  const handleDownloadZipClick = () => {
    // Save first, then request generation and download from returned URL
    setPendingAction("downloadZip");
    setSaveDialogOpen(true);
    handleMenuClose();
  };

  const handleReconcileClick = () => {
    setReconcileDialogOpen(true);
    handleMenuClose();
  };

  const handleReconciled = useCallback(
    (response: SaveOrchestratorResponse) => {
      const result = response.reconciliation ?? null;
      setDriftResult(result);
      onReconciliationChange?.(result);
      if (result) {
        setDriftReportOpen(true);
      }
    },
    [onReconciliationChange],
  );

  const handlePolicyScanToggle = (enabled: boolean) => {
    onPolicyScanChange({ ...policyScan, enabled });
  };

  const handleDownloadImage = async () => {
    handleMenuClose();
    try {
      await downloadFlowAsImage({
        fileName: orchestratorName
          ? `${orchestratorName}.png`
          : "orchestrator.png",
        backgroundColor: theme.palette.common.white,
      });
    } catch (error) {
      console.error("Failed to download orchestrator image", error);
    }
  };

  const openValidationDialog = useCallback(
    (
      issues: IaCValidationIssue[],
      action: "generate" | "downloadZip",
      orchestratorId: string,
    ) => {
      onValidationIssuesChange?.(issues);
      setValidationIssues(issues);
      setValidationAction(action);
      setValidationOrchestratorId(orchestratorId);
      setValidationDialogOpen(true);
    },
    [onValidationIssuesChange],
  );

  const closeValidationDialog = useCallback(() => {
    setValidationDialogOpen(false);
    setValidationIssues([]);
    setValidationOrchestratorId(null);
  }, []);

  const showPolicyFindingsIfAny = useCallback(
    (issues?: IaCValidationIssue[]) => {
      if (issues && issues.length > 0) {
        setPolicyFindings(issues);
        setPolicyFindingsDialogOpen(true);
      }
    },
    [],
  );

  const closePolicyFindingsDialog = useCallback(() => {
    setPolicyFindingsDialogOpen(false);
    setPolicyFindings([]);
  }, []);

  const triggerGenerate = useCallback(
    async (id: string, mode: "strict" | "draft" = "strict") => {
      setIsGenerating(true);
      try {
        const response = await orchestratorService.generateIac(id, { mode });
        onValidationIssuesChange?.(response.iacValidationIssues ?? []);
        showPolicyFindingsIfAny(response.policyValidationIssues);
        const hasIssues = Boolean(
          response.iacValidationIssues && response.iacValidationIssues.length > 0,
        );
        setSnackbar({
          open: true,
          ...buildGenerateSnackbar(
            hasIssues,
            "IaC generation request submitted successfully.",
            "Draft IaC generated with validation warnings.",
          ),
        });
      } catch (error: any) {
        console.error("Failed to generate IaC:", error);
        if (error instanceof IacValidationError) {
          openValidationDialog(error.issues, "generate", id);
          return;
        }
        setSnackbar({
          open: true,
          message: error?.message || "Failed to generate IaC",
          severity: "error",
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [onValidationIssuesChange, openValidationDialog, showPolicyFindingsIfAny],
  );

  const triggerDownload = useCallback(
    async (id: string, mode: "strict" | "draft" = "strict") => {
      setIsDownloading(true);
      try {
        const resp = await orchestratorService.generateIac(id, { mode });
        onValidationIssuesChange?.(resp.iacValidationIssues ?? []);
        showPolicyFindingsIfAny(resp.policyValidationIssues);
        const url = resp?.downloadIaCUrl;
        if (!url) {
          setSnackbar({
            open: true,
            message: "No download URL returned from server.",
            severity: "error",
          });
          return;
        }

        openDownloadLink(url);
        const hasIssues = Boolean(
          resp.iacValidationIssues && resp.iacValidationIssues.length > 0,
        );
        setSnackbar({
          open: true,
          ...buildGenerateSnackbar(
            hasIssues,
            "Your IaC zip is downloading.",
            "Draft IaC zip is downloading with validation warnings.",
          ),
        });
      } catch (error: any) {
        console.error("Failed to download IaC:", error);
        if (error instanceof IacValidationError) {
          openValidationDialog(error.issues, "downloadZip", id);
          return;
        }
        setSnackbar({
          open: true,
          message: error?.message || "Failed to download IaC",
          severity: "error",
        });
      } finally {
        setIsDownloading(false);
      }
    },
    [onValidationIssuesChange, openValidationDialog, showPolicyFindingsIfAny],
  );

  const handleProceedWithDraft = useCallback(async () => {
    if (!validationOrchestratorId) {
      return;
    }
    closeValidationDialog();
    if (validationAction === "downloadZip") {
      await triggerDownload(validationOrchestratorId, "draft");
      return;
    }
    await triggerGenerate(validationOrchestratorId, "draft");
  }, [
    closeValidationDialog,
    triggerDownload,
    triggerGenerate,
    validationAction,
    validationOrchestratorId,
  ]);

  const handleSaveSuccessInternal = useCallback(
    async (response: SaveOrchestratorResponse) => {
      const savedId = response?._id || response?.id;
      if (!savedId) {
        console.error("handleSaveSuccessInternal received empty id", {
          response,
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

      if (pendingAction === "none") {
        if (response.iacValidationIssues?.length) {
          openValidationDialog(response.iacValidationIssues, "generate", savedId);
        }
        showPolicyFindingsIfAny(response.policyValidationIssues);
      }

      const action = pendingAction;
      setPendingAction("none");
      if (action === "generate") {
        await triggerGenerate(savedId);
      } else if (action === "downloadZip") {
        await triggerDownload(savedId);
      }
    },
    [
      onSaveSuccess,
      openValidationDialog,
      pendingAction,
      showPolicyFindingsIfAny,
      triggerDownload,
      triggerGenerate,
    ],
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
          data-tour="orchestrator-menu"
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
        <MenuToggleItem
          icon={ArchitectureIcon}
          active={isArchitectureMode}
          primary="Architecture mode"
          secondary={isArchitectureMode ? "Compact arch's" : "Detailed forms"}
          ariaLabel="Toggle architecture mode"
          onToggle={onArchitectureModeChange}
        />

        <MenuToggleItem
          icon={ArchiveIcon}
          active={autoSaveEnabled}
          primary="Auto-save"
          secondary="Saves changes after you pause editing"
          ariaLabel="Toggle auto-save"
          onToggle={onAutoSaveEnabledChange}
        />

        <MenuToggleItem
          icon={PolicyIcon}
          active={policyScan.enabled}
          primary="Policy scan"
          secondary="Advisory security/compliance checks on generate"
          ariaLabel="Toggle policy scan"
          onToggle={handlePolicyScanToggle}
          extraAction={
            <Tooltip title="Policy scan settings" arrow>
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setPolicyScanSettingsOpen(true);
                }}
              >
                <SettingsOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
        />

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

        <PublishMenuItem
          canPublish={canPublish}
          isUpdate={Boolean(templateId)}
          activeColor={theme.palette.primary.main}
          disabledColor={theme.palette.action.disabled}
          onClick={() => {
            setPublishDialogOpen(true);
            handleMenuClose();
          }}
        />

        <MenuActionItem
          onClick={handleSaveClick}
          disabled={!canSave}
          icon={<SaveIcon fontSize="small" color={canSave ? "primary" : "disabled"} />}
          label="Save Orchestrator"
        />

        <DownloadZipMenuItem
          canSave={canSave}
          isDownloading={isDownloading}
          onClick={handleDownloadZipClick}
        />

        <MenuActionItem
          onClick={handleReconcileClick}
          disabled={!currentOrchestratorId}
          icon={
            <FactCheckOutlinedIcon
              fontSize="small"
              color={currentOrchestratorId ? "primary" : "disabled"}
            />
          }
          label="Reconcile State"
        />

        <MenuActionItem
          onClick={handleDeleteClick}
          disabled={!canDelete}
          destructive
          icon={
            <DeleteOutlineIcon
              fontSize="small"
              color={canDelete ? "error" : "disabled"}
            />
          }
          label="Delete Orchestrator"
        />
      </Menu>

      {/* Hidden SaveButton - controlled by menu */}
      <Box sx={{ display: "none" }}>
        <SaveButton
          nodes={nodes}
          edges={edges}
          templateInfo={templateInfo}
          policyScan={policyScan}
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

      {/* Publish as Template dialog */}
      {publishDialogOpen && (
        <PublishTemplateDialog
          open={publishDialogOpen}
          onClose={() => setPublishDialogOpen(false)}
          orchestratorId={currentOrchestratorId || ""}
          orchestratorName={orchestratorName}
          onSuccess={() => setPublishDialogOpen(false)}
        />
      )}

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

      <Dialog
        open={validationDialogOpen}
        onClose={closeValidationDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Fix required fields before strict IaC generation</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Some required values are missing. You can fix them now, or continue
            with a draft IaC artifact and fill the values after download.
          </Alert>
          <List dense disablePadding>
            {validationIssues.map((issue) => (
              <ListItem key={`${issue.nodeId}:${issue.field}`} disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <WarningAmberIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={issue.message}
                  secondary={`${issue.friendlyId || issue.nodeId} - ${issue.label}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeValidationDialog}>Fix now</Button>
          <Button onClick={handleProceedWithDraft} variant="contained">
            {validationAction === "downloadZip"
              ? "Download Draft Anyway"
              : "Generate Draft Anyway"}
          </Button>
        </DialogActions>
      </Dialog>

      <PolicyFindingsDialog
        open={policyFindingsDialogOpen}
        issues={policyFindings}
        onClose={closePolicyFindingsDialog}
      />

      <ReconcileDialog
        open={reconcileDialogOpen}
        onClose={() => setReconcileDialogOpen(false)}
        orchestratorId={currentOrchestratorId}
        onReconciled={handleReconciled}
      />

      <DriftReportDialog
        open={driftReportOpen}
        result={driftResult}
        onClose={() => setDriftReportOpen(false)}
      />

      <PolicyScanSettingsDialog
        open={policyScanSettingsOpen}
        policyScan={policyScan}
        onChange={onPolicyScanChange}
        onClose={() => setPolicyScanSettingsOpen(false)}
      />
    </>
  );
};
