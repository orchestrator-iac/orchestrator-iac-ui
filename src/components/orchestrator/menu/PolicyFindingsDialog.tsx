import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IaCValidationIssue } from "../../../types/orchestrator";

const CATEGORY_LABELS: Record<string, string> = {
  encryption: "Encryption",
  "public-exposure": "Public exposure",
  tagging: "Tagging",
  naming: "Naming",
  other: "Other",
};

const categoryLabel = (category?: string): string =>
  CATEGORY_LABELS[category || "other"] || "Other";

const groupByCategory = (
  issues: IaCValidationIssue[],
): Array<[string, IaCValidationIssue[]]> => {
  const groups = new Map<string, IaCValidationIssue[]>();
  for (const issue of issues) {
    const key = issue.category || "other";
    const existing = groups.get(key);
    if (existing) {
      existing.push(issue);
    } else {
      groups.set(key, [issue]);
    }
  }
  return Array.from(groups.entries());
};

interface PolicyFindingsDialogProps {
  open: boolean;
  issues: IaCValidationIssue[];
  onClose: () => void;
}

export const PolicyFindingsDialog: React.FC<PolicyFindingsDialogProps> = ({
  open,
  issues,
  onClose,
}) => {
  const groups = groupByCategory(issues);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Policy findings (advisory)</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          These are advisory policy suggestions and do not block export. Your
          Terraform bundle has already been generated.
        </Alert>
        {groups.map(([category, categoryIssues]) => (
          <Accordion key={category} defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>
                {categoryLabel(category)}
              </Typography>
              <Chip label={categoryIssues.length} size="small" sx={{ ml: 1 }} />
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {categoryIssues.map((issue, index) => (
                  <ListItem
                    key={`${issue.nodeId}:${issue.ruleId}:${index}`}
                    disableGutters
                    sx={{ alignItems: "flex-start" }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                      <InfoOutlinedIcon color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={issue.message}
                      secondary={`${issue.friendlyId || issue.nodeId}${
                        issue.ruleId ? ` · ${issue.ruleId}` : ""
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
        <DialogActions sx={{ p: 0, pt: 1 }}>
          <Button onClick={onClose} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyFindingsDialog;
