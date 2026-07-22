import React from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from "@mui/material";
import { PolicyScanSettings } from "../../../types/orchestrator";
import {
  POLICY_CATEGORY_KEYS,
  policyCategoryLabel,
} from "../../../utils/policyCategories";

interface PolicyScanSettingsDialogProps {
  open: boolean;
  policyScan: PolicyScanSettings;
  onChange: (value: PolicyScanSettings) => void;
  onClose: () => void;
}

export const PolicyScanSettingsDialog: React.FC<
  PolicyScanSettingsDialogProps
> = ({ open, policyScan, onChange, onClose }) => {
  const selectedCategories =
    policyScan.categories && policyScan.categories.length > 0
      ? policyScan.categories
      : POLICY_CATEGORY_KEYS;

  const handleCategoryToggle = (category: string) => {
    const next = new Set(selectedCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    // All categories selected is represented as "categories: undefined"
    // (matches the backend's "falsy = all" convention), not an explicit list.
    const categories =
      next.size === POLICY_CATEGORY_KEYS.length ? undefined : Array.from(next);
    onChange({ ...policyScan, categories });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Policy scan settings</DialogTitle>
      <DialogContent>
        <FormControlLabel
          sx={{ ml: 0, mb: 1 }}
          control={
            <Switch
              checked={policyScan.enabled}
              onChange={(_, checked) =>
                onChange({ ...policyScan, enabled: checked })
              }
            />
          }
          label="Run policy scan on generate"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Advisory security/compliance checks. Never blocks export.
        </Typography>
        <FormGroup sx={{ opacity: policyScan.enabled ? 1 : 0.5 }}>
          {POLICY_CATEGORY_KEYS.map((category) => (
            <FormControlLabel
              key={category}
              sx={{ ml: 0 }}
              control={
                <Checkbox
                  size="small"
                  checked={selectedCategories.includes(category)}
                  disabled={!policyScan.enabled}
                  onChange={() => handleCategoryToggle(category)}
                />
              }
              label={policyCategoryLabel(category)}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PolicyScanSettingsDialog;
