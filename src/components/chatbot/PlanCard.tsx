import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import type { PlanSchema, SecurityNote } from "@/types/chat";

// ── Security note icon / colour mapping ──────────────────────────────────────

const SEVERITY_META: Record<
  SecurityNote["severity"],
  { color: "info" | "warning" | "error"; icon: React.ReactNode }
> = {
  info: { color: "info", icon: <InfoOutlinedIcon fontSize="small" /> },
  warn: { color: "warning", icon: <WarningAmberIcon fontSize="small" /> },
  error: { color: "error", icon: <ErrorOutlineIcon fontSize="small" /> },
};

// ── Cloud provider chip colour ────────────────────────────────────────────────

const PROVIDER_COLOURS: Record<string, "primary" | "secondary" | "default"> = {
  aws: "primary",
  azure: "secondary",
  gcp: "default",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: PlanSchema;
  sessionId: string;
  onImplement?: (sessionId: string) => void;
  isImplementing?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  sessionId,
  onImplement,
  isImplementing = false,
}) => {
  const errorCount = plan.securityNotes.filter((n) => n.severity === "error").length;

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, overflow: "hidden", mt: 1, width: "100%" }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: "primary.main", px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="primary.contrastText" fontWeight={700}>
          Infrastructure Plan
        </Typography>
        <Typography variant="caption" color="primary.contrastText" sx={{ opacity: 0.85 }}>
          {plan.resources.length} resource{plan.resources.length === 1 ? "" : "s"}
          {plan.estimatedMonthlyUSD != null &&
            ` · ~$${plan.estimatedMonthlyUSD.toFixed(0)}/mo`}
        </Typography>
      </Box>

      {/* Summary */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {plan.summary}
        </Typography>
      </Box>

      <Divider />

      {/* Resource list */}
      <List dense disablePadding>
        {plan.resources.map((res, idx) => (
          <ListItem key={idx} alignItems="flex-start" sx={{ px: 2, py: 0.75 }}>
            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
              <CheckCircleOutlineIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>
                    {res.resourceName || res.resourceType}
                  </Typography>
                  <Chip
                    label={res.cloudProvider.toUpperCase()}
                    size="small"
                    color={PROVIDER_COLOURS[res.cloudProvider] ?? "default"}
                    sx={{ height: 18, fontSize: "0.6rem" }}
                  />
                  {res.dependencies.length > 0 && (
                    <Tooltip title={`Depends on: ${res.dependencies.join(", ")}`}>
                      <Chip
                        label={`+${res.dependencies.length} dep`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: "0.6rem" }}
                      />
                    </Tooltip>
                  )}
                </Stack>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {res.intent}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Security notes */}
      {plan.securityNotes.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              SECURITY NOTES
            </Typography>
            <Stack spacing={0.5} mt={0.5}>
              {plan.securityNotes.map((note, idx) => {
                const meta = SEVERITY_META[note.severity];
                return (
                  <Alert
                    key={idx}
                    severity={meta.color}
                    icon={meta.icon}
                    sx={{ py: 0, fontSize: "0.72rem", alignItems: "center" }}
                  >
                    {note.message}
                  </Alert>
                );
              })}
            </Stack>
          </Box>
        </>
      )}

      {/* Implement button */}
      <Divider />
      <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "flex-end" }}>
        {errorCount > 0 && (
          <Tooltip title={`Fix ${errorCount} security error(s) before implementing`}>
            <span>
              <Button
                variant="contained"
                color="error"
                size="small"
                disabled
                startIcon={<ErrorOutlineIcon />}
                sx={{ mr: 1 }}
              >
                {errorCount} Error{errorCount > 1 ? "s" : ""}
              </Button>
            </span>
          </Tooltip>
        )}
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<RocketLaunchIcon />}
          disabled={isImplementing || errorCount > 0}
          onClick={() => onImplement?.(sessionId)}
        >
          {isImplementing ? "Implementing…" : "Start Implementation"}
        </Button>
      </Box>
    </Paper>
  );
};

export default PlanCard;
