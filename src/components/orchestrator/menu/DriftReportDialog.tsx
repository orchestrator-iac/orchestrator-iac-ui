import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import { DriftFinding, DriftStatus, ReconciliationResult } from "../../../types/orchestrator";

const STATUS_META: Record<
  Exclude<DriftStatus, "unmanaged">,
  { label: string; color: "success" | "warning" | "default" | "info"; icon: React.ReactNode }
> = {
  in_sync: {
    label: "In sync",
    color: "success",
    icon: <CheckCircleOutlineIcon fontSize="small" color="success" />,
  },
  drifted: {
    label: "Drifted",
    color: "warning",
    icon: <WarningAmberIcon fontSize="small" color="warning" />,
  },
  not_applied: {
    label: "Not yet applied",
    color: "default",
    icon: <HourglassEmptyIcon fontSize="small" color="disabled" />,
  },
  unable_to_compare: {
    label: "Unable to compare",
    color: "info",
    icon: <HelpOutlineIcon fontSize="small" color="info" />,
  },
};

interface DriftReportDialogProps {
  open: boolean;
  result: ReconciliationResult | null;
  onClose: () => void;
}

const FindingRow: React.FC<{ finding: DriftFinding }> = ({ finding }) => {
  const meta = STATUS_META[finding.status];
  return (
    <ListItem alignItems="flex-start" sx={{ px: 2, py: 1 }}>
      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>{meta.icon}</ListItemIcon>
      <ListItemText
        primary={
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>
              {finding.friendlyId || finding.nodeId}
            </Typography>
            <Chip
              label={meta.label}
              size="small"
              color={meta.color}
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          </Stack>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            {finding.status === "drifted" &&
              finding.fields.map((field) => (
                <Typography
                  key={field.name}
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  <strong>{field.name}</strong>: expected{" "}
                  <code>{JSON.stringify(field.expected)}</code>, actual{" "}
                  <code>{JSON.stringify(field.actual)}</code>
                </Typography>
              ))}
            {finding.status === "unable_to_compare" && finding.reason && (
              <Typography variant="caption" color="text.secondary">
                {finding.reason}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );
};

export const DriftReportDialog: React.FC<DriftReportDialogProps> = ({
  open,
  result,
  onClose,
}) => {
  if (!result) {
    return null;
  }

  const { summary, findings, unmanagedResources } = result;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Terraform state reconciliation</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Advisory only — this comparison never changes your orchestrator or
          blocks any other action.
        </Alert>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip label={`${summary.inSync} in sync`} color="success" size="small" />
          <Chip label={`${summary.drifted} drifted`} color="warning" size="small" />
          <Chip label={`${summary.notApplied} not applied`} size="small" />
          <Chip label={`${summary.unmanaged} unmanaged`} color="info" size="small" />
          {summary.unableToCompare > 0 && (
            <Chip
              label={`${summary.unableToCompare} unable to compare`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>

        <Divider sx={{ mb: 1 }} />

        <List dense disablePadding>
          {findings.map((finding) => (
            <FindingRow key={finding.nodeId} finding={finding} />
          ))}
        </List>

        {unmanagedResources.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              UNMANAGED RESOURCES
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              Present in the uploaded state but not represented on this canvas.
            </Typography>
            <List dense disablePadding>
              {unmanagedResources.map((resource) => (
                <ListItem key={resource.address} sx={{ px: 2, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CloudQueueIcon fontSize="small" color="disabled" />
                  </ListItemIcon>
                  <ListItemText
                    primary={resource.address}
                    slotProps={{ primary: { variant: "body2" } }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriftReportDialog;
